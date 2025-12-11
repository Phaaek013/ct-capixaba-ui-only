// src/app/api/coach/alunos/[id]/confirmar-pagamento/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { calcularProximoVencimento } from "@/lib/aluno-acesso";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const user = await prisma.usuario.findUnique({
      where: { email: session.user.email },
      select: { id: true, tipo: true },
    });

    if (
      !user ||
      (user.tipo !== TipoUsuario.Coach && user.tipo !== TipoUsuario.Admin)
    ) {
      return NextResponse.json(
        { error: "Acesso negado." },
        { status: 403 }
      );
    }

    const alunoId = Number(params.id);
    if (!Number.isInteger(alunoId)) {
      return NextResponse.json(
        { error: "ID de aluno inválido." },
        { status: 400 }
      );
    }

    // Busca o aluno
    const aluno = await prisma.usuario.findUnique({
      where: { id: alunoId, tipo: TipoUsuario.Aluno },
      select: {
        id: true,
        diaVencimentoMensalidade: true,
        proximoVencimentoEm: true,
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    if (!aluno.diaVencimentoMensalidade) {
      return NextResponse.json(
        { error: "Aluno não possui dia de vencimento configurado." },
        { status: 400 }
      );
    }

    // Calcula o próximo vencimento a partir de HOJE
    // (não do vencimento anterior, pra garantir que sempre avança)
    const agora = new Date();
    const novoProximoVencimento = calcularProximoVencimento(
      aluno.diaVencimentoMensalidade,
      agora
    );

    // Se o próximo calculado for igual ou anterior ao atual, avança mais um mês
    if (
      aluno.proximoVencimentoEm &&
      novoProximoVencimento <= aluno.proximoVencimentoEm
    ) {
      novoProximoVencimento.setMonth(novoProximoVencimento.getMonth() + 1);
    }

    // Atualiza o aluno
    const alunoAtualizado = await prisma.usuario.update({
      where: { id: alunoId },
      data: {
        proximoVencimentoEm: novoProximoVencimento,
        ultimoPagamentoEm: agora,
        ativo: true, // Garante que desbloqueia
      },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        senhaPrecisaTroca: true,
        diaVencimentoMensalidade: true,
        proximoVencimentoEm: true,
        ultimoPagamentoEm: true,
      },
    });

    return NextResponse.json({
      id: alunoAtualizado.id,
      nome: alunoAtualizado.nome,
      email: alunoAtualizado.email,
      ativo: alunoAtualizado.ativo,
      senhaPrecisaTroca: alunoAtualizado.senhaPrecisaTroca,
      diaVencimentoMensalidade: alunoAtualizado.diaVencimentoMensalidade,
      proximoVencimentoEm: alunoAtualizado.proximoVencimentoEm?.toISOString() ?? null,
      ultimoPagamentoEm: alunoAtualizado.ultimoPagamentoEm?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("Erro ao confirmar pagamento:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao confirmar pagamento." },
      { status: 500 }
    );
  }
}
