import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      nome: true,
      email: true
    }
  });

  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json(usuario);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body || typeof (body as any).nome !== "string" || (body as any).nome.trim().length === 0) {
    return NextResponse.json({ error: "Campo 'nome' é obrigatório." }, { status: 400 });
  }

  const nome = (body as any).nome.trim();

  try {
    const usuarioAtualizado = await prisma.usuario.update({
      where: { email: session.user.email },
      data: { nome },
      select: {
        id: true,
        nome: true,
        email: true
      }
    });

    return NextResponse.json(usuarioAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar perfil do aluno:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
