import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { parseConteudo, getTituloFromBlocos } from "@/lib/treino-conteudo";
import { TreinoDetalheCard } from "@/components/TreinoDetalheCard";

import { AlunoFeedbackChatClient } from "./AlunoFeedbackChatClient";

interface PageProps {
  params: { treinoConclusaoId: string };
}

export default async function AlunoFeedbackChatPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true, tipo: true }
  });

  if (!usuario || usuario.tipo !== TipoUsuario.Aluno) {
    redirect("/");
  }

  const treinoConclusaoId = Number(params.treinoConclusaoId);
  if (Number.isNaN(treinoConclusaoId)) {
    notFound();
  }

  const conclusao = await prisma.treinoConclusao.findFirst({
    where: {
      id: treinoConclusaoId,
      usuarioId: usuario.id
    }
  });

  if (!conclusao) {
    notFound();
  }

  // Buscar título real do treino
  let tituloTreino = `Treino ${conclusao.treinoId}`;

  // Se treinoId é numérico, buscar no banco
  const treinoIdNumerico = Number(conclusao.treinoId);
  let blocos: ReturnType<typeof parseConteudo> | null = null;
  let videoUrl: string | null = null;

  if (!Number.isNaN(treinoIdNumerico)) {
    const treino = await prisma.treino.findUnique({
      where: { id: treinoIdNumerico },
      select: { conteudo: true, nomeModelo: true, videoUrl: true }
    });

    if (treino?.conteudo) {
      blocos = parseConteudo(treino.conteudo);
      tituloTreino = getTituloFromBlocos(blocos, treino.nomeModelo) || tituloTreino;
      videoUrl = treino.videoUrl;
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 pb-24 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-orange-400">Conversa</p>
        <h1 className="text-2xl font-bold text-foreground">{tituloTreino}</h1>
      </header>

      {/* Card do treino (compacto) */}
      {blocos && (
        <TreinoDetalheCard
          blocos={blocos}
          videoUrl={videoUrl}
          titulo={tituloTreino}
          compact
        />
      )}

      {/* Chat de mensagens */}
      <AlunoFeedbackChatClient
        treinoId={conclusao.treinoId}
        treinoConclusaoId={conclusao.id}
        tituloTreino={tituloTreino}
        dataTreino={conclusao.dataConclusao.toISOString()}
      />
    </div>
  );
}
