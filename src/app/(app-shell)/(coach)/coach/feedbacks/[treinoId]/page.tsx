import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { parseConteudo, getTituloFromBlocos } from "@/lib/treino-conteudo";
import { TreinoDetalheCard } from "@/components/TreinoDetalheCard";
import CoachFeedbackChatClient from "./CoachFeedbackChatClient";

type PageProps = {
  params: { treinoId: string };
  searchParams?: { alunoId?: string };
};

export default async function CoachFeedbackChatPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.tipo !== TipoUsuario.Coach && session.user.tipo !== TipoUsuario.Admin) {
    redirect("/aluno");
  }

  const alunoIdRaw = searchParams?.alunoId;
  const alunoId = alunoIdRaw ? Number(alunoIdRaw) : NaN;
  if (!alunoId || Number.isNaN(alunoId)) {
    throw new Error("alunoId é obrigatório na URL para abrir o chat do treino.");
  }

  const coach = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true, nome: true }
  });

  if (!coach) {
    throw new Error("Usuário coach não encontrado no banco.");
  }

  const treinoIdParam = params.treinoId;
  const treinoIdNum = Number(treinoIdParam);

  // Busca o treino para exibir os detalhes
  const treino = !Number.isNaN(treinoIdNum)
    ? await prisma.treino.findUnique({
        where: { id: treinoIdNum },
        select: { id: true, conteudo: true, nomeModelo: true, videoUrl: true, dataTreino: true }
      })
    : null;

  const treinoConclusao = await prisma.treinoConclusao.findUnique({
    where: {
      usuarioId_treinoId: {
        usuarioId: alunoId,
        treinoId: treinoIdParam
      }
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          avatarUrl: true
        }
      },
      mensagens: {
        orderBy: { criadoEm: "asc" },
        include: {
          autor: {
            select: {
              id: true,
              nome: true,
              avatarUrl: true,
              tipo: true
            }
          }
        }
      }
    }
  });

  if (!treinoConclusao) {
    notFound();
  }

  // Parsear conteúdo do treino
  const blocos = treino ? parseConteudo(treino.conteudo) : null;
  const treinoTitulo = blocos
    ? getTituloFromBlocos(blocos, treino?.nomeModelo) || `Treino ${treinoIdParam}`
    : `Treino ${treinoIdParam}`;

  const mensagens = treinoConclusao.mensagens.map((msg) => ({
    id: msg.id,
    texto: msg.texto,
    criadoEmISO: msg.criadoEm.toISOString(),
    autorNome: msg.autor.nome ?? "Sem nome",
    autorTipo: msg.autor.tipo,
    isMine: msg.autor.id === coach.id
  }));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 pb-24 space-y-6">
      {/* Header com info do aluno */}
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-orange-400">Conversa</p>
        <h1 className="text-2xl font-bold text-foreground">
          {treinoConclusao.usuario.nome ?? "Aluno"}
        </h1>
        <p className="text-sm text-muted-foreground">{treinoTitulo}</p>
      </header>

      {/* Card do treino (compacto para contexto) */}
      {blocos && (
        <TreinoDetalheCard
          blocos={blocos}
          videoUrl={treino?.videoUrl}
          titulo={treinoTitulo}
          compact
        />
      )}

      {/* Chat */}
      <CoachFeedbackChatClient
        coachId={coach.id}
        treinoId={treinoIdParam}
        treinoTitulo={treinoTitulo}
        alunoId={treinoConclusao.usuario.id}
        alunoNome={treinoConclusao.usuario.nome ?? "Aluno sem nome"}
        mensagensIniciais={mensagens}
      />
    </div>
  );
}
