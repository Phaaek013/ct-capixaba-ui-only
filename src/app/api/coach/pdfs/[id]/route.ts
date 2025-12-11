import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";

import { authOptions } from "@/auth";
import { registrarLog } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { resumirDestinatarios } from "@/lib/pdfs";
import { TipoUsuario } from "@/types/tipo-usuario";

interface RouteParams {
  id: string;
}

export async function DELETE(_request: NextRequest, { params }: { params: RouteParams }) {
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

    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const documento = await prisma.documentoPDF.findUnique({ where: { id } });

    if (!documento) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const relativePath = documento.filePath.replace(/^[/\\]+/, "");
    const absolutePath = path.join(process.cwd(), "public", relativePath);
    await fs.unlink(absolutePath).catch(() => undefined);

    await prisma.pdfDocumento.deleteMany({ where: { arquivoPath: documento.filePath } });
    await prisma.documentoPDF.delete({ where: { id } });

    await registrarLog(Number(session.user.id), "REMOVER_PDF", `id:${id}`);
    await revalidatePath("/coach/pdfs");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao remover PDF", error);
    return NextResponse.json({ error: "Erro ao remover PDF" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: RouteParams }) {
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

    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
    const alunosIds: number[] = Array.isArray(body?.alunosIds)
      ? body.alunosIds
          .map((valor: unknown) => Number(valor))
          .filter((valor: number) => Number.isInteger(valor) && valor > 0)
      : [];

    if (!titulo) {
      return NextResponse.json({ error: "Titulo obrigatorio" }, { status: 400 });
    }

    if (alunosIds.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um aluno" }, { status: 400 });
    }

    const documentoAtual = await prisma.documentoPDF.findUnique({
      where: { id },
      select: { filePath: true, dataEnvio: true }
    });

    if (!documentoAtual) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const documentoAtualizado = await prisma.documentoPDF.update({
      where: { id },
      data: {
        titulo,
        alunos: {
          set: alunosIds.map((alunoId) => ({ id: alunoId }))
        }
      },
      include: {
        alunos: {
          select: { id: true, nome: true }
        }
      }
    });

    await prisma.pdfDocumento.updateMany({
      where: { arquivoPath: documentoAtual.filePath },
      data: { titulo }
    });

    await registrarLog(Number(session.user.id), "EDITAR_PDF", `id:${id}`);
    await revalidatePath("/coach/pdfs");

    const resposta = {
      id: documentoAtualizado.id,
      titulo: documentoAtualizado.titulo,
      enviadoEmISO: documentoAtualizado.dataEnvio.toISOString(),
      qtdDestinatarios: documentoAtualizado.alunos.length,
      destinatariosResumo: resumirDestinatarios(documentoAtualizado.alunos.map((aluno) => aluno.nome)),
      url: documentoAtualizado.filePath,
      destinatariosIds: documentoAtualizado.alunos.map((aluno) => aluno.id)
    };

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao atualizar PDF", error);
    return NextResponse.json({ error: "Erro ao atualizar PDF" }, { status: 500 });
  }
}
