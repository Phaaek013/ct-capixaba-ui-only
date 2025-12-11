import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";

import { authOptions } from "@/auth";
import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { resumirDestinatarios, slugifyPdfTitle } from "@/lib/pdfs";
import { TipoUsuario } from "@/types/tipo-usuario";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coach = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, tipo: true }
    });

    if (!coach || (coach.tipo !== TipoUsuario.Coach && coach.tipo !== TipoUsuario.Admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const titulo = String(formData.get("titulo") || "").trim();
    const alunosIds = formData
      .getAll("alunosIds")
      .map((valor) => Number(valor))
      .filter((valor) => Number.isInteger(valor) && valor > 0);

    const arquivo = (formData.get("arquivo") || formData.get("file")) as File | null;

    if (!titulo || alunosIds.length === 0 || !arquivo) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }

    if (arquivo.type !== "application/pdf") {
      return NextResponse.json({ error: "Formato invalido" }, { status: 400 });
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = `${Date.now()}-${slugifyPdfTitle(titulo)}.pdf`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);
    const publicPath = `/uploads/${safeName}`;

    const documento = await prisma.documentoPDF.create({
      data: {
        titulo,
        filePath: publicPath,
        dataEnvio: new Date(),
        alunos: {
          connect: alunosIds.map((id) => ({ id }))
        }
      },
      include: {
        alunos: {
          select: { id: true, nome: true }
        }
      }
    });

    await prisma.pdfDocumento.create({
      data: {
        titulo,
        categoria: "OUTRO",
        arquivoPath: publicPath
      }
    });

    await registrarLog(
      Number(session.user.id),
      "ENVIAR_PDF",
      `${titulo} (${alunosIds.length} aluno${alunosIds.length === 1 ? "" : "s"})`
    );

    await revalidatePath("/coach/pdfs");

    const historicoItem = {
      id: documento.id,
      titulo: documento.titulo,
      enviadoEmISO: documento.dataEnvio.toISOString(),
      qtdDestinatarios: documento.alunos.length,
      destinatariosResumo: resumirDestinatarios(documento.alunos.map((a) => a.nome)),
      url: documento.filePath,
      destinatariosIds: documento.alunos.map((a) => a.id)
    };

    return NextResponse.json(historicoItem, { status: 201 });
  } catch (error) {
    console.error("Erro ao enviar PDF", error);
    return NextResponse.json({ error: "Erro ao enviar PDF" }, { status: 500 });
  }
}
