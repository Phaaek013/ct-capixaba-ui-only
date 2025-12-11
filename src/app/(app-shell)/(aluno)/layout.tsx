import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { getAlunoAcessoInfo } from "@/lib/aluno-acesso";
import { AlunoBottomNav } from "@/components/aluno/AlunoBottomNav";
import { MensalidadeWrapper } from "@/components/mensalidade";

export default async function AlunoLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Busca o usuário para pegar o ID e flag de troca de senha
  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true, tipo: true, senhaPrecisaTroca: true },
  });

  if (!usuario || usuario.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  // Guard: se precisa trocar senha, redireciona (exceto se já estiver na tela de alterar senha)
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Se o aluno precisa trocar a senha e não está na rota de alterar senha, redireciona
  if (usuario.senhaPrecisaTroca && !pathname.includes("/primeiro-acesso/alterar-senha")) {
    redirect("/primeiro-acesso/alterar-senha");
  }

  // Verifica status da mensalidade
  const acessoInfo = await getAlunoAcessoInfo(usuario.id);

  return (
    <MensalidadeWrapper
      status={acessoInfo.status}
      proximoVencimento={acessoInfo.proximoVencimento?.toISOString() ?? null}
      diasRestantes={acessoInfo.diasRestantes}
    >
      <div className="pb-24">{children}</div>
      <AlunoBottomNav />
    </MensalidadeWrapper>
  );
}
