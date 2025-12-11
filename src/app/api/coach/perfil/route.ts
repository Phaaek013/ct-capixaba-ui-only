// src/app/api/coach/perfil/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import path from "path";
import { promises as fs } from "fs";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const coach = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true, nome: true, email: true, avatarUrl: true, tipo: true },
  });

  if (!coach || (coach.tipo !== TipoUsuario.Coach && coach.tipo !== TipoUsuario.Admin)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  return NextResponse.json({
    id: coach.id,
    nome: coach.nome ?? "",
    email: coach.email,
    avatarUrl: coach.avatarUrl ?? null,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const coach = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true, tipo: true },
  });

  if (!coach || (coach.tipo !== TipoUsuario.Coach && coach.tipo !== TipoUsuario.Admin)) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const formData = await req.formData();
  const nome = (formData.get("nome") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const file = formData.get("avatar") as File | null;

  if (!nome || !email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Nome e e-mail válidos são obrigatórios." },
      { status: 400 }
    );
  }

  let avatarUrl: string | undefined;

  if (file && file.size > 0) {
    const ext = path.extname(file.name) || ".png";
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `coach-${coach.id}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);
    avatarUrl = `/uploads/avatars/${filename}`;
  }

  try {
    const atualizado = await prisma.usuario.update({
      where: { id: coach.id },
      data: {
        nome,
        email: email.toLowerCase(),
        ...(avatarUrl ? { avatarUrl } : {}),
      },
      select: { id: true, nome: true, email: true, avatarUrl: true },
    });

    return NextResponse.json({
      id: atualizado.id,
      nome: atualizado.nome ?? "",
      email: atualizado.email,
      avatarUrl: atualizado.avatarUrl ?? null,
    });
  } catch (err: unknown) {
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um usuário com este e-mail." },
        { status: 409 }
      );
    }

    console.error("Erro ao atualizar perfil do coach:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao salvar perfil." },
      { status: 500 }
    );
  }
}
