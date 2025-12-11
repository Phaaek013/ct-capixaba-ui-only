import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { TipoUsuario } from "@/types/tipo-usuario";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: {
    treinoId: string;
  };
};

function serializeDate(date: Date | null | undefined) {
  return date ? date.toISOString() : null;
}

function isCoachOuAdmin(tipo: string | null | undefined) {
  return tipo === TipoUsuario.Coach || tipo === TipoUsuario.Admin;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const treinoId = decodeURIComponent(params.treinoId);
    const alunoIdParam = req.nextUrl.searchParams.get("alunoId");

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, tipo: true }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const visualizadorEhAluno = usuario.tipo === TipoUsuario.Aluno;

    let alvoAlunoId: number;
    if (visualizadorEhAluno) {
      alvoAlunoId = usuario.id;
    } else {
      if (!alunoIdParam) {
        return NextResponse.json({ error: "alunoId é obrigatório para Coach/Admin" }, { status: 400 });
      }
      const parsed = Number(alunoIdParam);
      if (!Number.isFinite(parsed)) {
        return NextResponse.json({ error: "alunoId inválido" }, { status: 400 });
      }
      alvoAlunoId = parsed;
    }

    const treinoConclusao = await prisma.treinoConclusao.findUnique({
      where: {
        usuarioId_treinoId: {
          usuarioId: alvoAlunoId,
          treinoId
        }
      },
      select: { id: true }
    });

    if (!treinoConclusao) {
      return NextResponse.json({ treinoConclusaoId: null, mensagens: [] });
    }

    let mensagensData = await prisma.treinoMensagem.findMany({
      where: { treinoConclusaoId: treinoConclusao.id },
      orderBy: { criadoEm: "asc" },
      select: {
        id: true,
        texto: true,
        criadoEm: true,
        lidoPeloAlunoEm: true,
        lidoPeloCoachEm: true,
        autor: {
          select: { id: true, nome: true, email: true, tipo: true, avatarUrl: true }
        }
      }
    });

    const agora = new Date();
    let marcouMensagensDoCoachComoLidas = false;

    if (visualizadorEhAluno) {
      const idsParaAtualizar = mensagensData
        .filter((mensagem) => isCoachOuAdmin(mensagem.autor.tipo) && !mensagem.lidoPeloAlunoEm)
        .map((mensagem) => mensagem.id);

      if (idsParaAtualizar.length > 0) {
        await prisma.treinoMensagem.updateMany({
          where: { id: { in: idsParaAtualizar } },
          data: { lidoPeloAlunoEm: agora }
        });
        marcouMensagensDoCoachComoLidas = true;
        const idsSet = new Set(idsParaAtualizar);
        mensagensData = mensagensData.map((mensagem) =>
          idsSet.has(mensagem.id)
            ? { ...mensagem, lidoPeloAlunoEm: agora }
            : mensagem
        );
      }
    } else {
      const idsParaAtualizar = mensagensData
        .filter((mensagem) => mensagem.autor.tipo === TipoUsuario.Aluno && !mensagem.lidoPeloCoachEm)
        .map((mensagem) => mensagem.id);

      if (idsParaAtualizar.length > 0) {
        await prisma.treinoMensagem.updateMany({
          where: { id: { in: idsParaAtualizar } },
          data: { lidoPeloCoachEm: agora }
        });
        const idsSet = new Set(idsParaAtualizar);
        mensagensData = mensagensData.map((mensagem) =>
          idsSet.has(mensagem.id)
            ? { ...mensagem, lidoPeloCoachEm: agora }
            : mensagem
        );
      }
    }

    const mensagens = mensagensData.map((mensagem) => ({
      id: mensagem.id,
      texto: mensagem.texto,
      criadoEm: serializeDate(mensagem.criadoEm),
      lidoPeloAlunoEm: serializeDate(mensagem.lidoPeloAlunoEm),
      lidoPeloCoachEm: serializeDate(mensagem.lidoPeloCoachEm),
      autor: {
        id: mensagem.autor.id,
        nome: mensagem.autor.nome,
        email: mensagem.autor.email,
        tipo: mensagem.autor.tipo,
        avatarUrl: mensagem.autor.avatarUrl
      }
    }));

    return NextResponse.json({
      treinoConclusaoId: treinoConclusao.id,
      mensagens,
      marcouMensagensDoCoachComoLidas
    });
  } catch (error) {
    console.error("[GET /api/treinos/[treinoId]/mensagens]", error);
    return NextResponse.json({ error: "Erro ao carregar mensagens" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const treinoId = decodeURIComponent(params.treinoId);
    const url = new URL(req.url);
    const alunoIdParam = url.searchParams.get("alunoId");

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, tipo: true, nome: true, email: true }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch (error) {
      body = null;
    }

    const texto = typeof body?.texto === "string" ? body.texto.trim() : "";

    if (!texto) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    if (texto.length > 1000) {
      return NextResponse.json({ error: "Mensagem muito longa" }, { status: 400 });
    }

    let alvoAlunoId: number;
    if (usuario.tipo === TipoUsuario.Aluno) {
      alvoAlunoId = usuario.id;
    } else {
      if (!alunoIdParam) {
        return NextResponse.json({ error: "alunoId é obrigatório para Coach/Admin" }, { status: 400 });
      }
      const parsed = Number(alunoIdParam);
      if (!Number.isFinite(parsed)) {
        return NextResponse.json({ error: "alunoId inválido" }, { status: 400 });
      }
      alvoAlunoId = parsed;
    }

    const treinoConclusao = await prisma.treinoConclusao.findUnique({
      where: {
        usuarioId_treinoId: {
          usuarioId: alvoAlunoId,
          treinoId
        }
      }
    });

    if (!treinoConclusao) {
      return NextResponse.json({ error: "Treino ainda não foi concluído por esse aluno" }, { status: 404 });
    }

    const novaMensagem = await prisma.treinoMensagem.create({
      data: {
        treinoConclusaoId: treinoConclusao.id,
        autorId: usuario.id,
        texto
      },
      include: {
        autor: {
          select: { id: true, nome: true, email: true, tipo: true }
        }
      }
    });

    return NextResponse.json({
      ok: true,
      mensagem: {
        id: novaMensagem.id,
        texto: novaMensagem.texto,
        criadoEm: serializeDate(novaMensagem.criadoEm),
        lidoPeloAlunoEm: serializeDate(novaMensagem.lidoPeloAlunoEm),
        lidoPeloCoachEm: serializeDate(novaMensagem.lidoPeloCoachEm),
        autor: {
          id: novaMensagem.autor.id,
          nome: novaMensagem.autor.nome,
          email: novaMensagem.autor.email,
          tipo: novaMensagem.autor.tipo
        }
      }
    });
  } catch (error) {
    console.error("[POST /api/treinos/[treinoId]/mensagens]", error);
    return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
