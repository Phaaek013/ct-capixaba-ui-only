import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { parseConteudo, getTituloFromBlocos } from "@/lib/treino-conteudo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TreinoDetalheCard } from "@/components/TreinoDetalheCard";
import { WorkoutActionsClient } from "./WorkoutActionsClient";

type TreinoDetalhePageProps = {
  params: {
    treinoId: string;
  };
};

export default async function TreinoDetalhePage({ params }: TreinoDetalhePageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  // Converte ID para número
  const treinoId = Number(params.treinoId);
  if (Number.isNaN(treinoId)) {
    notFound();
  }

  // Busca o treino pertencente a este aluno
  const treino = await prisma.treino.findFirst({
    where: {
      id: treinoId,
      ehModelo: false,
      aluno: {
        email: session.user.email!,
      },
    },
    include: {
      coach: {
        select: { id: true, nome: true },
      },
    },
  });

  if (!treino) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 pb-24">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Treino não encontrado</h1>
          <p className="text-sm text-muted-foreground">
            O treino que você tentou acessar não existe ou não está disponível.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/aluno/calendario">Voltar para o calendário</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Parse do conteúdo JSON
  const blocos = parseConteudo(treino.conteudo);
  const titulo = getTituloFromBlocos(blocos, treino.nomeModelo) || "Treino";

  const usuarioId = Number(session.user.id);
  if (Number.isNaN(usuarioId)) {
    throw new Error("ID de usuário inválido na sessão");
  }

  // Verifica se já foi concluído (usando o ID como string para compatibilidade)
  const treinoConclusao = await prisma.treinoConclusao.findUnique({
    where: {
      usuarioId_treinoId: {
        usuarioId,
        treinoId: String(treinoId),
      },
    },
    include: {
      mensagens: {
        orderBy: { criadoEm: "asc" },
        include: {
          autor: {
            select: { id: true, nome: true, avatarUrl: true, tipo: true },
          },
        },
      },
    },
  });

  const jaConcluido = Boolean(treinoConclusao);
  const conclusaoInicial = treinoConclusao
    ? {
        feedbackText: treinoConclusao.feedbackText ?? "",
        dataConclusao: treinoConclusao.dataConclusao.toISOString(),
      }
    : null;

  const mensagensIniciais =
    treinoConclusao?.mensagens?.map((mensagem) => ({
      id: mensagem.id,
      autorId: mensagem.autorId,
      autorTipo: mensagem.autor.tipo,
      autorNome: mensagem.autor.nome,
      autorAvatarUrl: mensagem.autor.avatarUrl,
      mensagem: mensagem.texto,
      createdAtIso: mensagem.criadoEm.toISOString(),
    })) ?? [];

  const dataLabel = treino.dataTreino
    ? format(treino.dataTreino, "EEEE, d 'de' MMMM", { locale: ptBR })
    : "Data não informada";

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50">
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-0 pb-24 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-orange-400">Plano do dia</p>
          <h1 className="text-3xl font-bold text-foreground">{titulo}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{dataLabel}</span>
            {treino.coach && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1">
                Coach: {treino.coach.nome}
              </span>
            )}
            {blocos.foco && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1">
                Foco: {blocos.foco}
              </span>
            )}
          </div>
        </header>

        {/* Blocos do treino e vídeo */}
        <TreinoDetalheCard
          blocos={blocos}
          videoUrl={treino.videoUrl}
          titulo={titulo}
        />

        {/* Feedback + marcar como feito */}
        <div className="pt-2">
          <WorkoutActionsClient
            treinoId={String(treinoId)}
            alunoId={usuarioId}
            jaConcluido={jaConcluido}
            conclusaoInicial={conclusaoInicial}
            mensagensIniciais={mensagensIniciais}
          />
        </div>

        {/* Botão voltar */}
        <Button asChild variant="secondary" size="sm" className="mt-4">
          <Link href="/aluno/calendario">Voltar para o calendário</Link>
        </Button>
      </main>
    </div>
  );
}
