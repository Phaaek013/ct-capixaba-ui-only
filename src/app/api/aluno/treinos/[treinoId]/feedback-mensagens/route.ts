import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import type { Session } from "next-auth";

type RouteContext = {
  params: {
    treinoId: string;
  };
};

type MensagemPayload = {
  mensagem: string;
};

function ensureAlunoSession(session: Session | null) {
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, message: "Sessão inválida." }, { status: 401 });
  }

  if (session.user.tipo !== TipoUsuario.Aluno) {
    return NextResponse.json({ ok: false, message: "Apenas alunos podem enviar mensagens." }, { status: 403 });
  }

  return null;
}

function serializeMensagem(mensagem: {
  id: number;
  autorId: number;
  texto: string;
  criadoEm: Date;
  lidoPeloAlunoEm: Date | null;
  lidoPeloCoachEm: Date | null;
  autor: {
    id: number;
    nome: string;
    avatarUrl: string | null;
    tipo: string;
  };
}) {
  return {
    id: mensagem.id,
    autorId: mensagem.autorId,
    autorTipo: mensagem.autor.tipo,
    autorNome: mensagem.autor.nome,
    autorAvatarUrl: mensagem.autor.avatarUrl,
    texto: mensagem.texto,
    createdAtIso: mensagem.criadoEm.toISOString(),
    lidoPeloAlunoEm: mensagem.lidoPeloAlunoEm?.toISOString() ?? null,
    lidoPeloCoachEm: mensagem.lidoPeloCoachEm?.toISOString() ?? null
  };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const authError = ensureAlunoSession(session);
  if (authError) return authError;

  const treinoId = params.treinoId;
  if (!treinoId) {
    return NextResponse.json({ ok: false, message: "treinoId obrigatório." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session!.user!.email! },
    select: { id: true }
  });

  if (!usuario) {
    return NextResponse.json({ ok: false, message: "Usuário não encontrado." }, { status: 404 });
  }

  const treinoConclusao = await prisma.treinoConclusao.findUnique({
    where: {
      usuarioId_treinoId: {
        usuarioId: usuario.id,
        treinoId
      }
    },
    include: {
      mensagens: {
        orderBy: { criadoEm: "asc" },
        include: {
          autor: {
            select: { id: true, nome: true, avatarUrl: true, tipo: true }
          }
        }
      }
    }
  });

  const mensagens = (treinoConclusao?.mensagens ?? []).map(serializeMensagem);

  return NextResponse.json({
    ok: true,
    mensagens,
    jaConcluido: Boolean(treinoConclusao),
    ultimaConclusaoIso: treinoConclusao?.dataConclusao.toISOString() ?? null
  });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  const authError = ensureAlunoSession(session);
  if (authError) return authError;

  const treinoId = params.treinoId;
  if (!treinoId) {
    return NextResponse.json({ ok: false, message: "treinoId obrigatório." }, { status: 400 });
  }

  let payload: MensagemPayload;
  try {
    payload = (await req.json()) as MensagemPayload;
  } catch (error) {
    console.error("[TREINO FEEDBACK] Erro ao parsear body", error);
    return NextResponse.json({ ok: false, message: "JSON inválido." }, { status: 400 });
  }

  const mensagem = typeof payload.mensagem === "string" ? payload.mensagem.trim() : "";
  if (!mensagem) {
    return NextResponse.json({ ok: false, message: "Mensagem obrigatória." }, { status: 400 });
  }

  if (mensagem.length > 2000) {
    return NextResponse.json({ ok: false, message: "Mensagem muito longa." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session!.user!.email! },
    select: { id: true, nome: true }
  });

  if (!usuario) {
    return NextResponse.json({ ok: false, message: "Usuário não encontrado." }, { status: 404 });
  }

  const agora = new Date();

  const treinoConclusao = await prisma.treinoConclusao.upsert({
    where: {
      usuarioId_treinoId: {
        usuarioId: usuario.id,
        treinoId
      }
    },
    update: {
      dataConclusao: agora
    },
    create: {
      usuarioId: usuario.id,
      treinoId,
      feedbackText: null,
      dataConclusao: agora
    }
  });

  const novaMensagem = await prisma.treinoMensagem.create({
    data: {
      treinoConclusaoId: treinoConclusao.id,
      autorId: usuario.id,
      texto: mensagem
    },
    include: {
      autor: {
        select: { id: true, nome: true, avatarUrl: true, tipo: true }
      }
    }
  });

  return NextResponse.json({
    ok: true,
    mensagem: serializeMensagem(novaMensagem),
    jaConcluido: true,
    ultimaConclusaoIso: treinoConclusao.dataConclusao.toISOString()
  } as const);
}
