import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { AlunoHomeClient } from "./AlunoHomeClient";
import TreinoHojeResumoAlunoClient from "./TreinoHojeResumoAlunoClient";

export default async function AlunoDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      nome: true,
      email: true,
      avatarUrl: true
    }
  });

  if (!usuario) {
    redirect("/login");
  }

  // Data de hoje para buscar treino real
  const dataHojeISO = format(new Date(), "yyyy-MM-dd");

  // Buscar últimos treinos reais do banco (últimos 5)
  const ultimosTreinosDb = await prisma.treino.findMany({
    where: {
      alunoId: usuario.id,
      ehModelo: false,
      dataTreino: { not: null },
    },
    orderBy: { dataTreino: "desc" },
    take: 5,
    select: {
      id: true,
      dataTreino: true,
      nomeModelo: true,
      conteudo: true,
    },
  });

  const ultimosTreinos = ultimosTreinosDb.map((t) => {
    let titulo = t.nomeModelo || "Treino";
    if (!t.nomeModelo && t.conteudo) {
      try {
        const blocos = JSON.parse(t.conteudo);
        titulo = blocos.titulo || blocos.foco || "Treino";
      } catch {
        // ignora
      }
    }
    return {
      id: String(t.id),
      title: titulo,
      date: t.dataTreino
        ? format(t.dataTreino, "dd/MM/yyyy")
        : "Sem data",
    };
  });

  return (
    <AlunoHomeClient
      alunoNome={usuario.nome}
      alunoEmail={usuario.email}
      alunoAvatarUrl={usuario.avatarUrl}
      dataHojeISO={dataHojeISO}
      alunoId={usuario.id}
      ultimosTreinos={ultimosTreinos}
    />
  );
}
