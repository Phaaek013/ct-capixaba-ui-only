// src/app/api/coach/alunos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

function parseDiaVencimento(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  const n = Number(raw);

  if (!Number.isInteger(n) || n < 1 || n > 31) {
    throw new Error("DIA_VENCIMENTO_INVALIDO");
  }

  return n;
}

export async function PATCH(
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

    const body = await req.json();
    
    // DEBUG: log do body recebido
    console.log("=== PATCH /api/coach/alunos/[id] ===");
    console.log("Body recebido:", JSON.stringify(body, null, 2));
    
    const { nome, email, novaSenha, diaVencimentoMensalidade } = body as {
      nome?: string;
      email?: string;
      novaSenha?: string | null;
      diaVencimentoMensalidade?: number | string | null;
    };

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      diaVencimentoMensalidade: parseDiaVencimento(diaVencimentoMensalidade),
    };

    if (novaSenha && novaSenha.trim()) {
      const senhaLimpa = novaSenha.trim();
      console.log(">>> novaSenha detectada, vai setar senhaPrecisaTroca = true");

      if (senhaLimpa.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          { error: `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` },
          { status: 400 }
        );
      }

      data.senhaHash = await bcrypt.hash(senhaLimpa, 10);
      data.senhaPrecisaTroca = true;
    }

    const alunoAtualizado = await prisma.usuario.update({
      where: { id: alunoId, tipo: TipoUsuario.Aluno },
      data,
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

    console.log(">>> Aluno atualizado no DB:", JSON.stringify(alunoAtualizado, null, 2));
    console.log("=== FIM PATCH ===");

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
  } catch (err: unknown) {
    console.error("Erro ao atualizar aluno:", err);

    if (err instanceof Error && err.message === "DIA_VENCIMENTO_INVALIDO") {
      return NextResponse.json(
        {
          error:
            "Dia de vencimento inválido. Use um número entre 1 e 31 ou deixe em branco.",
        },
        { status: 400 }
      );
    }

    const prismaErr = err as { code?: string };

    if (prismaErr?.code === "P2025") {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    if (prismaErr?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um usuário com este e-mail." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro inesperado ao salvar aluno." },
      { status: 500 }
    );
  }
}
