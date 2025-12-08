import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { compararSenha, hashSenha } from "@/utils/crypto";
import { registrarLog } from "@/lib/log";
import { revalidatePath } from "next/cache";
import { TipoUsuario } from "@/types/tipo-usuario";
import { Card, PageHeader, PasswordInput, Button } from "@/components/ui";

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

  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md space-y-6">
        <PageHeader title="Alterar senha" description="Defina uma nova senha para continuar usando o sistema." />
        {mensagemErro === "invalid" && (
          <p className="text-sm text-red-600">As senhas precisam corresponder e ter pelo menos 8 caracteres.</p>
        )}
        {mensagemErro === "senha" && <p className="text-sm text-red-600">Senha atual incorreta.</p>}
        <form action={alterarSenha} className="space-y-4">
          <PasswordInput label="Senha atual" id="senhaAtual" name="senhaAtual" required />
          <PasswordInput label="Nova senha" id="novaSenha" name="novaSenha" minLength={8} required />
          <PasswordInput label="Confirmar nova senha" id="confirmar" name="confirmar" minLength={8} required />
          <Button type="submit">Salvar nova senha</Button>
        </form>
      </Card>
    </div>
  );
}
