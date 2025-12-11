import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { compararSenha, hashSenha } from "@/utils/crypto";
import { registrarLog } from "@/lib/log";
import { revalidatePath } from "next/cache";
import { TipoUsuario } from "@/types/tipo-usuario";
import AlterarSenhaForm from "./AlterarSenhaForm";

async function alterarSenha(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const senhaAtual = String(formData.get("senhaAtual") || "");
  const novaSenha = String(formData.get("novaSenha") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (novaSenha.length < 8 || novaSenha !== confirmar) {
    redirect("/primeiro-acesso/alterar-senha?error=invalid");
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: Number(session.user.id) } });
  if (!usuario) {
    redirect("/login");
  }

  const confere = await compararSenha(senhaAtual, usuario!.senhaHash);
  if (!confere) {
    redirect("/primeiro-acesso/alterar-senha?error=senha");
  }

  const novaHash = await hashSenha(novaSenha);

  await prisma.usuario.update({
    where: { id: usuario!.id },
    data: { senhaHash: novaHash, senhaPrecisaTroca: false }
  });

  await registrarLog(usuario!.id, "ALTERAR_SENHA");
  revalidatePath("/");
  if (usuario!.tipo === TipoUsuario.Coach) {
    redirect("/coach");
  }
  redirect("/aluno");
}

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

export default async function AlterarSenhaPrimeiroAcesso({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const erroQuery = typeof searchParams?.error === "string" ? searchParams?.error : null;

  return (
    <AlterarSenhaForm erroQuery={erroQuery} alterarSenhaAction={alterarSenha} />
  );
}
