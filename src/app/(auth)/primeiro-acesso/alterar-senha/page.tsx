import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { compararSenha, hashSenha } from "@/utils/crypto";
import { registrarLog } from "@/lib/log";
import { revalidatePath } from "next/cache";
import { TipoUsuario } from "@/types/tipo-usuario";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Alert, Label, PasswordInput, Button } from "@/components/ui";

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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            CT Capixaba
          </div>
          <div className="space-y-1">
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>Defina uma nova senha para continuar usando o sistema</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {mensagemErro === "invalid" && (
            <Alert variant="error" className="mb-5">
              As senhas precisam corresponder e ter pelo menos 8 caracteres.
            </Alert>
          )}
          {mensagemErro === "senha" && (
            <Alert variant="error" className="mb-5">
              Senha atual incorreta.
            </Alert>
          )}

          <form action={alterarSenha} className="space-y-5">
            <div>
              <Label htmlFor="senhaAtual">Senha atual</Label>
              <PasswordInput
                id="senhaAtual"
                name="senhaAtual"
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="novaSenha">Nova senha</Label>
              <PasswordInput
                id="novaSenha"
                name="novaSenha"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <Label htmlFor="confirmar">Confirmar nova senha</Label>
              <PasswordInput
                id="confirmar"
                name="confirmar"
                required
                minLength={8}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full">
              Salvar nova senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
