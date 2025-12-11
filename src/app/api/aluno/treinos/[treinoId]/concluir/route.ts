import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";

type RouteContext = {
  params: {
    treinoId: string;
  };
};

/**
 * POST /api/aluno/treinos/[treinoId]/concluir
 * 
 * Regras de produto:
 * 1. Treino concluído SEM texto: registra conclusão, NÃO cria mensagem
 * 2. Treino concluído COM texto: registra conclusão + cria mensagem (entra na contagem de feedbacks)
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ ok: false, message: "Não autenticado." }, { status: 401 });
    }

    if (session.user.tipo !== TipoUsuario.Aluno) {
      return NextResponse.json({ ok: false, message: "Apenas alunos podem concluir treinos." }, { status: 403 });
    }

    const treinoId = params.treinoId;
    if (!treinoId) {
      return NextResponse.json({ ok: false, message: "treinoId obrigatório." }, { status: 400 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Normalizar texto de feedback
    const rawFeedback = typeof body.feedbackText === "string" ? body.feedbackText : "";
    const feedbackText = rawFeedback.trim();
    const temTexto = feedbackText.length > 0;

    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true }
    });

    if (!usuario) {
      return NextResponse.json({ ok: false, message: "Usuário não encontrado." }, { status: 404 });
    }

    // 1. SEMPRE faz upsert da conclusão
    const conclusao = await prisma.treinoConclusao.upsert({
      where: {
        usuarioId_treinoId: {
          usuarioId: usuario.id,
          treinoId
        }
      },
      update: {
        feedbackText: temTexto ? feedbackText : null,
        dataConclusao: new Date()
      },
      create: {
        usuarioId: usuario.id,
        treinoId,
        feedbackText: temTexto ? feedbackText : null
      }
    });

    // 2. Se TEM texto, cria mensagem (que entra na contagem de feedbacks pendentes)
    if (temTexto) {
      // Verifica se já existe uma mensagem com esse mesmo texto (evita duplicatas)
      const ultimaMensagem = await prisma.treinoMensagem.findFirst({
        where: {
          treinoConclusaoId: conclusao.id,
          autorId: usuario.id
        },
        orderBy: { criadoEm: "desc" }
      });

      // Só cria se não for duplicata do último feedback
      if (!ultimaMensagem || ultimaMensagem.texto !== feedbackText) {
        await prisma.treinoMensagem.create({
          data: {
            treinoConclusaoId: conclusao.id,
            autorId: usuario.id,
            texto: feedbackText
            // lidoPeloCoachEm = null → pendente para o coach
          }
        });

        console.log("[TREINO CONCLUÍDO COM FEEDBACK]", {
          treinoId,
          alunoEmail: usuario.email,
          feedbackText: feedbackText.slice(0, 50) + (feedbackText.length > 50 ? "..." : "")
        });
      }
    } else {
      console.log("[TREINO CONCLUÍDO SEM FEEDBACK]", {
        treinoId,
        alunoEmail: usuario.email
      });
    }

    return NextResponse.json({ 
      ok: true,
      temFeedback: temTexto
    }, { status: 200 });
  } catch (error) {
    console.error("[ERRO CONCLUIR TREINO]", error);
    return NextResponse.json({ ok: false, message: "Erro interno ao concluir treino." }, { status: 500 });
  }
}
