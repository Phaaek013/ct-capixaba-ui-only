import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { senhaAtual, novaSenha } = (payload ?? {}) as { senhaAtual?: string; novaSenha?: string };

  if (!senhaAtual || !novaSenha) {
    return NextResponse.json({ error: "Informe senha atual e nova senha." }, { status: 400 });
  }

  const senhaAtualLimpa = senhaAtual.trim();
  const novaSenhaLimpa = novaSenha.trim();

  if (!senhaAtualLimpa || !novaSenhaLimpa) {
    return NextResponse.json({ error: "Os campos de senha não podem ficar vazios." }, { status: 400 });
  }

  if (novaSenhaLimpa.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` }, { status: 400 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario || !usuario.senhaHash) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const senhaConfere = await comparePassword(senhaAtualLimpa, usuario.senhaHash);

    if (!senhaConfere) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 403 });
    }

    const novaHash = await hashPassword(novaSenhaLimpa);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senhaHash: novaHash,
        senhaPrecisaTroca: false
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao atualizar senha do aluno:", error);
    return NextResponse.json({ error: "Erro ao atualizar senha." }, { status: 500 });
  }
}
