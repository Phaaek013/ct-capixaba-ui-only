import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { TreinoModelo } from "@/types/treino";
import { parseConteudo, serializeConteudo, BlocosTreino } from "@/lib/treino-conteudo";

function buildConteudo(body: Record<string, unknown>): string {
  const blocos: BlocosTreino = {
    foco: typeof body.foco === "string" ? body.foco : undefined,
    mobilidade: typeof body.mobilidade === "string" ? body.mobilidade : undefined,
    aquecimento: typeof body.aquecimento === "string" ? body.aquecimento : undefined,
    skillForca: typeof body.skillForca === "string" ? body.skillForca : undefined,
    wod: typeof body.wod === "string" ? body.wod : undefined,
    alongamento: typeof body.alongamento === "string" ? body.alongamento : undefined,
  };
  return serializeConteudo(blocos);
}

// GET /api/coach/modelos-treino
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.tipo !== TipoUsuario.Coach) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const coachId = parseInt(session.user.id, 10);

    const modelosDb = await prisma.treino.findMany({
      where: { coachId, ehModelo: true },
      orderBy: { nomeModelo: "asc" },
    });

    const modelos: TreinoModelo[] = modelosDb.map((m) => {
      const parsed = parseConteudo(m.conteudo);
      return {
        id: String(m.id),
        titulo: m.nomeModelo || parsed.foco || "Modelo sem nome",
        foco: parsed.foco ?? null,
        mobilidade: parsed.mobilidade ?? null,
        aquecimento: parsed.aquecimento ?? null,
        skillForca: parsed.skillForca ?? null,
        wod: parsed.wod ?? null,
        alongamento: parsed.alongamento ?? null,
        videoUrl: m.videoUrl ?? parsed.videoUrl ?? null,
      };
    });

    return NextResponse.json({ modelos });
  } catch (error) {
    console.error("Erro ao buscar modelos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST /api/coach/modelos-treino - Criar modelo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.tipo !== TipoUsuario.Coach) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const coachId = parseInt(session.user.id, 10);
    const body = await request.json();
    const { titulo, videoUrl } = body;

    if (!titulo?.trim()) {
      return NextResponse.json(
        { error: "O título do modelo é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se já existe modelo com esse nome (do mesmo coach)
    const existente = await prisma.treino.findFirst({
      where: {
        coachId,
        ehModelo: true,
        nomeModelo: titulo.trim(),
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Já existe um modelo com esse título" },
        { status: 400 }
      );
    }

    const conteudo = buildConteudo(body);

    const created = await prisma.treino.create({
      data: {
        alunoId: null,
        coachId,
        dataTreino: null,
        conteudo,
        videoUrl: videoUrl || null,
        nomeModelo: titulo.trim(),
        ehModelo: true,
      },
    });

    const parsed = parseConteudo(conteudo);
    const modelo: TreinoModelo = {
      id: String(created.id),
      titulo: titulo.trim(),
      foco: parsed.foco ?? null,
      mobilidade: parsed.mobilidade ?? null,
      aquecimento: parsed.aquecimento ?? null,
      skillForca: parsed.skillForca ?? null,
      wod: parsed.wod ?? null,
      alongamento: parsed.alongamento ?? null,
      videoUrl: videoUrl || parsed.videoUrl || null,
    };

    return NextResponse.json({ modelo });
  } catch (error) {
    console.error("Erro ao criar modelo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
