import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }

  const blob = file as File;
  const bytes = await blob.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const maxSize = 2 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return NextResponse.json({ error: "Imagem muito grande. Limite de 2 MB." }, { status: 413 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!usuario) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const mime = blob.type;
  let ext = "png";
  if (mime === "image/jpeg") ext = "jpg";
  else if (mime === "image/webp") ext = "webp";

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `aluno-${usuario.id}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, buffer);

  const relativePath = `/uploads/avatars/${fileName}`;

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { avatarUrl: relativePath }
  });

  return NextResponse.json({ avatarUrl: relativePath });
}
