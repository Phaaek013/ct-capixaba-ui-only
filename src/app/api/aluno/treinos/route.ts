import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { parseConteudo } from "@/lib/treino-conteudo";

// --- Helpers internos ---

async function getAlunoFromSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const aluno = await prisma.usuario.findUnique({
    where: { email: session.user.email },
  });

  if (!aluno || aluno.tipo !== TipoUsuario.Aluno) {
    return null;
  }

  return aluno;
}

function parseDataParam(rawData: string | null): { data?: Date; error?: string } {
  if (!rawData) {
    return { error: "Parâmetro 'data' (YYYY-MM-DD) é obrigatório" };
  }

  const data = new Date(rawData + "T12:00:00.000Z");

  if (Number.isNaN(data.getTime())) {
    return { error: "Parâmetro 'data' inválido" };
  }

  return { data };
}

function serializeTreino(t: {
  id: number;
  alunoId: number | null;
  coachId: number | null;
  dataTreino: Date | null;
  conteudo: string | null;
  videoUrl: string | null;
  ehModelo: boolean;
  nomeModelo: string | null;
  createdAt: Date;
  updatedAt: Date;
  coach?: { id: number; nome: string } | null;
}) {
  const blocos = parseConteudo(t.conteudo);
  return {
    id: t.id,
    alunoId: t.alunoId,
    coachId: t.coachId,
    dataTreino: t.dataTreino?.toISOString() ?? null,
    conteudo: blocos,
    videoUrl: t.videoUrl,
    ehModelo: t.ehModelo,
    nomeModelo: t.nomeModelo,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    coach: t.coach ?? null,
    // Campos de conveniência para a UI
    titulo: t.nomeModelo || blocos.foco || "Treino",
    temMobilidade: Boolean(blocos.mobilidade),
    temAquecimento: Boolean(blocos.aquecimento),
    temSkillForca: Boolean(blocos.skillForca),
    temWod: Boolean(blocos.wod),
    temAlongamento: Boolean(blocos.alongamento),
  };
}

// --- GET /api/aluno/treinos?data=YYYY-MM-DD ---
// Se não passar data, retorna treinos dos últimos 30 dias (para histórico)

export async function GET(request: NextRequest) {
  try {
    const aluno = await getAlunoFromSession();

    if (!aluno) {
      return NextResponse.json(
        { error: "Apenas aluno autenticado pode acessar seus treinos" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawData = searchParams.get("data");
    const historico = searchParams.get("historico") === "true";

    // Se pedir histórico ou não passar data, retorna últimos 30 dias
    if (historico || !rawData) {
      const hoje = new Date();
      const trintaDiasAtras = subDays(hoje, 30);

      const treinos = await prisma.treino.findMany({
        where: {
          alunoId: aluno.id,
          ehModelo: false,
          dataTreino: {
            gte: startOfDay(trintaDiasAtras),
            lte: endOfDay(hoje),
          },
        },
        include: {
          coach: {
            select: { id: true, nome: true },
          },
        },
        orderBy: { dataTreino: "desc" },
      });

      return NextResponse.json(treinos.map(serializeTreino), { status: 200 });
    }

    // Busca treino de uma data específica
    const { data, error } = parseDataParam(rawData);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const treinos = await prisma.treino.findMany({
      where: {
        alunoId: aluno.id,
        ehModelo: false,
        dataTreino: {
          gte: startOfDay(data!),
          lte: endOfDay(data!),
        },
      },
      include: {
        coach: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(treinos.map(serializeTreino), { status: 200 });
  } catch (err) {
    console.error("Erro ao buscar treinos do aluno:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
