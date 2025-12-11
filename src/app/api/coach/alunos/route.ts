// src/app/api/coach/alunos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (
    session.user.tipo !== TipoUsuario.Coach &&
    session.user.tipo !== TipoUsuario.Admin
  ) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();

  const nome = String(body.nome ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const senha = String(body.senha ?? "");
  const diaVencimentoMensalidadeRaw = body.diaVencimentoMensalidade;

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  if (!senha || senha.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` },
      { status: 400 }
    );
  }

  let diaVencimentoMensalidade: number | null = null;
  if (
    diaVencimentoMensalidadeRaw !== null &&
    diaVencimentoMensalidadeRaw !== undefined
  ) {
    const n = Number(diaVencimentoMensalidadeRaw);
    if (!Number.isInteger(n) || n < 1 || n > 31) {
      return NextResponse.json(
        { error: "Dia de vencimento deve estar entre 1 e 31" },
        { status: 400 }
      );
    }
    diaVencimentoMensalidade = n;
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const aluno = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        tipo: TipoUsuario.Aluno,
        ativo: true,
        senhaPrecisaTroca: true,
        diaVencimentoMensalidade,
      },
    });

    return NextResponse.json(
      {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        ativo: aluno.ativo,
        senhaPrecisaTroca: aluno.senhaPrecisaTroca,
        diaVencimentoMensalidade: aluno.diaVencimentoMensalidade,
        proximoVencimentoEm: aluno.proximoVencimentoEm?.toISOString() ?? null,
        ultimoPagamentoEm: aluno.ultimoPagamentoEm?.toISOString() ?? null,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um usuário com este e-mail" },
        { status: 409 }
      );
    }

    console.error("Erro ao criar aluno", err);
    return NextResponse.json({ error: "Erro ao criar aluno" }, { status: 500 });
  }
}
