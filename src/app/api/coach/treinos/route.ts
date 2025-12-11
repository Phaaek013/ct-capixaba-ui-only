import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { startOfDay, endOfDay } from "date-fns";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { parseConteudo, serializeConteudo, BlocosTreino } from "@/lib/treino-conteudo";

// --- Helpers internos ---

async function getCoachFromSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const coach = await prisma.usuario.findUnique({
    where: { email: session.user.email },
  });

  if (!coach || coach.tipo !== TipoUsuario.Coach) {
    return null;
  }

  return coach;
}

function parseDataTreinoParam(rawData: string | null): { data?: Date; error?: string } {
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
  aluno?: { id: number; nome: string } | null;
  conclusoes?: { usuarioId: number }[];
}) {
  return {
    id: t.id,
    alunoId: t.alunoId,
    coachId: t.coachId,
    dataTreino: t.dataTreino?.toISOString() ?? null,
    conteudo: parseConteudo(t.conteudo),
    videoUrl: t.videoUrl,
    ehModelo: t.ehModelo,
    nomeModelo: t.nomeModelo,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    aluno: t.aluno ?? null,
    isConcluido: t.conclusoes ? t.conclusoes.some(c => c.usuarioId === t.alunoId) : false,
  };
}

// --- GET /api/coach/treinos?data=YYYY-MM-DD&alunoId=123 ---

export async function GET(request: NextRequest) {
  try {
    const coach = await getCoachFromSession();

    if (!coach) {
      return NextResponse.json(
        { error: "Apenas coach autenticado pode listar treinos" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawData = searchParams.get("data");
    const rawAlunoId = searchParams.get("alunoId");

    const { data, error } = parseDataTreinoParam(rawData);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const alunoId = rawAlunoId ? Number(rawAlunoId) : undefined;
    if (rawAlunoId && Number.isNaN(alunoId)) {
      return NextResponse.json(
        { error: "Parâmetro 'alunoId' inválido" },
        { status: 400 }
      );
    }

    const treinos = await prisma.treino.findMany({
      where: {
        coachId: coach.id,
        ehModelo: false,
        dataTreino: {
          gte: startOfDay(data!),
          lte: endOfDay(data!),
        },
        ...(alunoId ? { alunoId } : {}),
      },
      include: {
        aluno: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Busca conclusões para os treinos encontrados (treinoId é String no TreinoConclusao)
    const treinoIds = treinos.map((t) => String(t.id));
    const conclusoes = await prisma.treinoConclusao.findMany({
      where: {
        treinoId: { in: treinoIds },
      },
      select: {
        treinoId: true,
        usuarioId: true,
      },
    });

    // Agrupa conclusões por treinoId
    const conclusoesPorTreino = conclusoes.reduce((acc, c) => {
      if (!acc[c.treinoId]) acc[c.treinoId] = [];
      acc[c.treinoId].push({ usuarioId: c.usuarioId });
      return acc;
    }, {} as Record<string, { usuarioId: number }[]>);

    const resposta = treinos.map((t) =>
      serializeTreino({ ...t, conclusoes: conclusoesPorTreino[String(t.id)] ?? [] })
    );

    return NextResponse.json(resposta, { status: 200 });
  } catch (err) {
    console.error("Erro ao buscar treinos:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// --- POST /api/coach/treinos ---

type PostBody = {
  dataTreino: string;        // "YYYY-MM-DD"
  alunoIds: number[];
  blocos: BlocosTreino;
  videoUrl?: string;
  salvarComoModelo?: boolean;
  nomeModelo?: string;
};

export async function POST(request: NextRequest) {
  try {
    const coach = await getCoachFromSession();

    if (!coach) {
      return NextResponse.json(
        { error: "Apenas coach autenticado pode criar treinos" },
        { status: 401 }
      );
    }

    let body: PostBody;
    try {
      body = (await request.json()) as PostBody;
    } catch {
      return NextResponse.json(
        { error: "JSON de requisição inválido" },
        { status: 400 }
      );
    }

    const { dataTreino, alunoIds, blocos, videoUrl, salvarComoModelo, nomeModelo } = body;

    // Validações
    const { data, error } = parseDataTreinoParam(dataTreino);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!Array.isArray(alunoIds) || alunoIds.length === 0) {
      return NextResponse.json(
        { error: "Pelo menos um aluno deve ser selecionado" },
        { status: 400 }
      );
    }

    if (salvarComoModelo && !nomeModelo) {
      return NextResponse.json(
        { error: "nomeModelo é obrigatório quando salvarComoModelo = true" },
        { status: 400 }
      );
    }

    const conteudoStr = serializeConteudo(blocos ?? {});

    // Cria treinos em transação
    const treinosCriados = await prisma.$transaction(
      alunoIds.map((alunoId) =>
        prisma.treino.create({
          data: {
            alunoId,
            coachId: coach.id,
            dataTreino: data,
            conteudo: conteudoStr,
            videoUrl: videoUrl ?? null,
            ehModelo: false,
            nomeModelo: null,
          },
          include: {
            aluno: {
              select: { id: true, nome: true },
            },
          },
        })
      )
    );

    let modelo = null;

    if (salvarComoModelo) {
      modelo = await prisma.treino.create({
        data: {
          coachId: coach.id,
          conteudo: conteudoStr,
          videoUrl: videoUrl ?? null,
          ehModelo: true,
          nomeModelo: nomeModelo ?? null,
          alunoId: null,
          dataTreino: null,
        },
      });
    }

    const resposta = {
      treinos: treinosCriados.map(serializeTreino),
      modelo: modelo ? serializeTreino({ ...modelo, aluno: null }) : null,
    };

    return NextResponse.json(resposta, { status: 201 });
  } catch (err: unknown) {
    // Trata violação de unique (alunoId + dataTreino)
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        {
          error: "Já existe treino para um dos alunos nesta data. Use edição em vez de criação.",
        },
        { status: 409 }
      );
    }

    console.error("Erro ao criar treinos:", err);
    return NextResponse.json({ error: "Erro ao criar treinos" }, { status: 500 });
  }
}

// --- PATCH /api/coach/treinos ---

type PatchBody = {
  id: number;
  blocos?: BlocosTreino;
  videoUrl?: string | null;
  dataTreino?: string;
  salvarComoModelo?: boolean;
  nomeModelo?: string;
};

export async function PATCH(request: NextRequest) {
  try {
    const coach = await getCoachFromSession();

    if (!coach) {
      return NextResponse.json(
        { error: "Apenas coach autenticado pode editar treinos" },
        { status: 401 }
      );
    }

    let body: PatchBody;
    try {
      body = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json(
        { error: "JSON de requisição inválido" },
        { status: 400 }
      );
    }

    const { id, blocos, videoUrl, dataTreino, salvarComoModelo, nomeModelo } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Campo 'id' numérico é obrigatório para edição" },
        { status: 400 }
      );
    }

    if (salvarComoModelo && !nomeModelo) {
      return NextResponse.json(
        { error: "nomeModelo é obrigatório quando salvarComoModelo = true" },
        { status: 400 }
      );
    }

    // Garante que o treino é do coach e não é modelo
    const treinoExistente = await prisma.treino.findFirst({
      where: {
        id,
        coachId: coach.id,
        ehModelo: false,
      },
    });

    if (!treinoExistente) {
      return NextResponse.json(
        { error: "Treino não encontrado para este coach" },
        { status: 404 }
      );
    }

    // Monta dataTreino nova (se enviada)
    let novaDataTreino: Date | undefined;
    if (typeof dataTreino !== "undefined") {
      const result = parseDataTreinoParam(dataTreino);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      novaDataTreino = result.data;
    }

    // Monta objeto de update
    const dataUpdate: {
      conteudo?: string;
      videoUrl?: string | null;
      dataTreino?: Date;
    } = {};

    if (typeof blocos !== "undefined") {
      dataUpdate.conteudo = serializeConteudo(blocos ?? {});
    }

    if (typeof videoUrl !== "undefined") {
      dataUpdate.videoUrl = videoUrl ?? null;
    }

    if (typeof novaDataTreino !== "undefined") {
      dataUpdate.dataTreino = novaDataTreino;
    }

    if (Object.keys(dataUpdate).length === 0 && !salvarComoModelo) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    let treinoAtualizado = treinoExistente;

    if (Object.keys(dataUpdate).length > 0) {
      treinoAtualizado = await prisma.treino.update({
        where: { id: treinoExistente.id },
        data: dataUpdate,
      });
    }

    let modelo = null;

    if (salvarComoModelo) {
      // Blocos usados para o modelo: se vieram no body, usa; senão, parse do treino atualizado
      const blocosParaModelo =
        typeof blocos !== "undefined"
          ? blocos
          : parseConteudo(treinoAtualizado.conteudo);

      const conteudoModeloStr = serializeConteudo(blocosParaModelo ?? {});

      modelo = await prisma.treino.create({
        data: {
          coachId: coach.id,
          conteudo: conteudoModeloStr,
          videoUrl: treinoAtualizado.videoUrl,
          ehModelo: true,
          nomeModelo: nomeModelo ?? null,
          alunoId: null,
          dataTreino: null,
        },
      });
    }

    const resposta = {
      treino: serializeTreino({ ...treinoAtualizado, aluno: null }),
      modelo: modelo ? serializeTreino({ ...modelo, aluno: null }) : null,
    };

    return NextResponse.json(resposta, { status: 200 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        {
          error: "Já existe treino para este aluno nesta nova data. Use outra data.",
        },
        { status: 409 }
      );
    }

    console.error("Erro ao atualizar treino:", err);
    return NextResponse.json({ error: "Erro ao atualizar treino" }, { status: 500 });
  }
}

// --- DELETE /api/coach/treinos ---

type DeleteBody = {
  id: number;
};

export async function DELETE(request: NextRequest) {
  try {
    const coach = await getCoachFromSession();

    if (!coach) {
      return NextResponse.json(
        { error: "Apenas coach autenticado pode apagar treinos" },
        { status: 401 }
      );
    }

    let body: DeleteBody;
    try {
      body = (await request.json()) as DeleteBody;
    } catch {
      return NextResponse.json(
        { error: "JSON de requisição inválido" },
        { status: 400 }
      );
    }

    const { id } = body;

    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { error: "Campo 'id' numérico é obrigatório para exclusão" },
        { status: 400 }
      );
    }

    const treinoExistente = await prisma.treino.findFirst({
      where: {
        id,
        coachId: coach.id,
        ehModelo: false,
      },
    });

    if (!treinoExistente) {
      return NextResponse.json(
        { error: "Treino não encontrado para este coach" },
        { status: 404 }
      );
    }

    await prisma.treino.delete({
      where: { id: treinoExistente.id },
    });

    return NextResponse.json(
      { ok: true, deletedId: treinoExistente.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erro ao deletar treino:", err);
    return NextResponse.json({ error: "Erro ao deletar treino" }, { status: 500 });
  }
}
