// src/app/(app-shell)/(coach)/coach/alunos/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { CoachAlunosClient } from "./CoachAlunosClient";

export default async function CoachAlunosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (
    session.user.tipo !== TipoUsuario.Coach &&
    session.user.tipo !== TipoUsuario.Admin
  ) {
    redirect("/aluno");
  }

  const alunos = await prisma.usuario.findMany({
    where: { tipo: TipoUsuario.Aluno },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      email: true,
      ativo: true,
      senhaPrecisaTroca: true,
      diaVencimentoMensalidade: true,
      proximoVencimentoEm: true,
      ultimoPagamentoEm: true,
      createdAt: true,
    },
  });

  const alunosNormalizados = alunos.map((a) => ({
    id: a.id,
    nome: a.nome ?? "(sem nome)",
    email: a.email ?? "",
    ativo: a.ativo ?? true,
    senhaPrecisaTroca: a.senhaPrecisaTroca ?? false,
    diaVencimentoMensalidade: a.diaVencimentoMensalidade ?? null,
    proximoVencimentoEm: a.proximoVencimentoEm?.toISOString() ?? null,
    ultimoPagamentoEm: a.ultimoPagamentoEm?.toISOString() ?? null,
    criadoEm: a.createdAt?.toISOString() ?? null,
  }));

  return <CoachAlunosClient alunosIniciais={alunosNormalizados} />;
}
