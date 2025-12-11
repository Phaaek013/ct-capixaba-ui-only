import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { TreinoBase } from "@/types/treino";
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

// PATCH /api/coach/treinos/[id] - Atualizar treino
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.tipo !== TipoUsuario.Coach) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const coachId = parseInt(session.user.id, 10);
    const { id } = await params;
    const treinoId = parseInt(id, 10);

    if (isNaN(treinoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { titulo, alunoIds, videoUrl, salvarComoModelo, tituloModelo, data } = body;

    const conteudo = buildConteudo(body);

    // Busca o treino original (somente do coach logado)
    const treinoOriginal = await prisma.treino.findFirst({
      where: { id: treinoId, coachId },
    });

    if (!treinoOriginal) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    // Se mudou os alunos, precisa criar/atualizar treinos para cada um
    if (alunoIds && alunoIds.length > 0) {
      const dataTreino = data
        ? new Date(data + "T12:00:00.000Z")
        : treinoOriginal.dataTreino;

      // Remove treinos antigos dessa data (exceto modelos) - somente do coach
      if (dataTreino) {
        await prisma.treino.deleteMany({
          where: {
            coachId,
            dataTreino,
            ehModelo: false,
            id: { not: treinoId },
          },
        });
      }

      // Cria/atualiza para cada aluno
      for (const alunoId of alunoIds) {
        await prisma.treino.upsert({
          where: {
            alunoId_dataTreino: {
              alunoId: parseInt(alunoId, 10),
              dataTreino: dataTreino!,
            },
          },
          update: {
            conteudo,
            videoUrl: videoUrl || null,
            nomeModelo: titulo || null,
          },
          create: {
            alunoId: parseInt(alunoId, 10),
            coachId,
            dataTreino,
            conteudo,
            videoUrl: videoUrl || null,
            nomeModelo: titulo || null,
            ehModelo: false,
          },
        });
      }
    } else {
      // Atualiza apenas o treino existente
      await prisma.treino.update({
        where: { id: treinoId },
        data: {
          conteudo,
          videoUrl: videoUrl || null,
          nomeModelo: titulo || null,
        },
      });
    }

    // Salvar como modelo se solicitado
    if (salvarComoModelo && (tituloModelo || titulo)) {
      // Verifica se já existe modelo com esse nome (do mesmo coach)
      const existingModelo = await prisma.treino.findFirst({
        where: {
          coachId,
          ehModelo: true,
          nomeModelo: tituloModelo || titulo,
        },
      });

      if (existingModelo) {
        await prisma.treino.update({
          where: { id: existingModelo.id },
          data: {
            conteudo,
            videoUrl: videoUrl || null,
          },
        });
      } else {
        await prisma.treino.create({
          data: {
            alunoId: null,
            coachId,
            dataTreino: null,
            conteudo,
            videoUrl: videoUrl || null,
            nomeModelo: tituloModelo || titulo,
            ehModelo: true,
          },
        });
      }
    }

    const parsed = parseConteudo(conteudo);
    const treino: TreinoBase = {
      id,
      titulo: titulo || parsed.foco || "Treino",
      data: data || treinoOriginal.dataTreino?.toISOString().slice(0, 10) || "",
      alunosResumo: `${alunoIds?.length || 1} aluno(s)`,
      alunoIds: alunoIds || [String(treinoOriginal.alunoId)],
      foco: parsed.foco ?? null,
      mobilidade: parsed.mobilidade ?? null,
      aquecimento: parsed.aquecimento ?? null,
      skillForca: parsed.skillForca ?? null,
      wod: parsed.wod ?? null,
      alongamento: parsed.alongamento ?? null,
      videoUrl: videoUrl || parsed.videoUrl || null,
      modeloId: null,
    };

    return NextResponse.json({ treino });
  } catch (error) {
    console.error("Erro ao atualizar treino:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/coach/treinos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.tipo !== TipoUsuario.Coach) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const coachId = parseInt(session.user.id, 10);
    const { id } = await params;
    const treinoId = parseInt(id, 10);

    if (isNaN(treinoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verifica se o treino pertence ao coach
    const treino = await prisma.treino.findFirst({
      where: { id: treinoId, coachId },
    });

    if (!treino) {
      return NextResponse.json({ error: "Treino não encontrado" }, { status: 404 });
    }

    await prisma.treino.delete({
      where: { id: treinoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar treino:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
