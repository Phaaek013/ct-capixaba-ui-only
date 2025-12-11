import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import PerfilAlunoClient from "./PerfilAlunoClient";

export default async function PerfilAlunoPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      nome: true,
      email: true,
      avatarUrl: true,
      diaVencimentoMensalidade: true,
      proximoVencimentoEm: true
    }
  });

  if (!usuario) {
    redirect("/login");
  }

  const user = {
    name: usuario.nome,
    email: usuario.email,
    avatarUrl: usuario.avatarUrl ?? null
  };

  const mensalidadeInfo = {
    diaVencimentoMensalidade: usuario.diaVencimentoMensalidade ?? null,
    proximoVencimentoEm: usuario.proximoVencimentoEm?.toISOString() ?? null
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-orange-400">Perfil</p>
        <h1 className="text-2xl font-bold text-foreground">Meus dados</h1>
        <p className="text-sm text-muted-foreground">Informações básicas da sua conta no CT Capixaba.</p>
      </header>

      {/* Card de perfil com layout base; conteúdo dinâmico fica no client */}
      <Card className="bg-black/40 px-4 py-6">
        <PerfilAlunoClient user={user} mensalidade={mensalidadeInfo} />
      </Card>
    </div>
  );
}
