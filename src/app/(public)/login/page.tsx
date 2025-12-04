import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LoginForm from "./login-form";
import { TipoUsuario } from "@/types/tipo-usuario";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    if (session.user.senhaPrecisaTroca) {
      redirect("/primeiro-acesso/alterar-senha");
    }
    if (session.user.tipo === TipoUsuario.Coach) {
      redirect("/coach");
    }
    redirect("/aluno");
  }

  const totalCoaches = await prisma.usuario.count({ where: { tipo: TipoUsuario.Coach } });

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            CT Capixaba
          </div>
          <div className="space-y-1">
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        {totalCoaches === 0 && (
          <CardFooter className="flex-col">
            <p className="text-sm text-zinc-400 text-center">
              Nenhum coach cadastrado ainda.{' '}
              <Link href="/setup" className="text-orange-600 hover:text-orange-500 transition-colors">
                Configurar primeiro coach
              </Link>
              .
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
