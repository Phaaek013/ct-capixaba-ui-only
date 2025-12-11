import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { parseConteudo, getTituloFromBlocos } from "@/lib/treino-conteudo";

import { AlunoFeedbacksClient } from "./AlunoFeedbacksClient";

export default async function AlunoFeedbackPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!usuario) {
    redirect("/login");
  }

  // Apenas conclusões com mensagens (mesma lógica do coach)
  const conclusoes = await prisma.treinoConclusao.findMany({
    where: {
      usuarioId: usuario.id,
      mensagens: { some: {} }
    },
    include: {
      mensagens: {
        include: {
          autor: {
            select: { tipo: true, nome: true }
          }
        },
        orderBy: { criadoEm: "asc" }
      },
      _count: {
        select: { mensagens: true }
      }
    },
    orderBy: { dataConclusao: "desc" }
  });

  // Busca os treinos para pegar títulos reais
  const treinoIds = conclusoes
    .map(c => Number(c.treinoId))
    .filter(id => !Number.isNaN(id));
  
  const treinos = await prisma.treino.findMany({
    where: { id: { in: treinoIds } },
    select: { id: true, conteudo: true, nomeModelo: true, dataTreino: true }
  });
  
  const treinoMap = new Map(treinos.map(t => [String(t.id), t]));

  const conclusoesOrdenadas = conclusoes
    .map((conclusao) => {
      const ultimaMensagem = conclusao.mensagens[conclusao.mensagens.length - 1] ?? null;
      const referencia = ultimaMensagem?.criadoEm ?? conclusao.dataConclusao;

      return {
        conclusao,
        referencia
      };
    })
    .sort((a, b) => b.referencia.getTime() - a.referencia.getTime())
    .map(({ conclusao }) => conclusao);

  const conclusoesParaCliente = conclusoesOrdenadas.map((conclusao) => {
    // Buscar título do treino real
    const treino = treinoMap.get(conclusao.treinoId);
    let treinoTitulo = `Treino ${conclusao.treinoId}`;
    let dataTreino = conclusao.dataConclusao;
    
    if (treino) {
      const blocos = parseConteudo(treino.conteudo);
      treinoTitulo = getTituloFromBlocos(blocos, treino.nomeModelo) || treinoTitulo;
      dataTreino = treino.dataTreino || dataTreino;
    }

    // Determinar tipo de interação
    const mensagensDoAluno = conclusao.mensagens.filter(
      m => m.autor.tipo === TipoUsuario.Aluno
    );
    const totalMensagens = conclusao._count.mensagens;
    const isSoFeedbackInicial = totalMensagens === 1 && mensagensDoAluno.length === 1;
    const tipoInteracao: "feedback" | "mensagem" = isSoFeedbackInicial ? "feedback" : "mensagem";

    return {
      id: conclusao.id,
      treinoId: conclusao.treinoId,
      treino: {
        id: conclusao.treinoId,
        titulo: treinoTitulo,
        dataTreinoIso: dataTreino.toISOString()
      },
      tipoInteracao,
      totalMensagens,
      mensagens: conclusao.mensagens.map((mensagem) => ({
        id: mensagem.id,
        texto: mensagem.texto,
        criadoEmIso: mensagem.criadoEm.toISOString(),
        lidoPeloAlunoEmIso: mensagem.lidoPeloAlunoEm?.toISOString() ?? null,
        lidoPeloCoachEmIso: mensagem.lidoPeloCoachEm?.toISOString() ?? null,
        autor: { tipo: mensagem.autor.tipo as TipoUsuario, nome: mensagem.autor.nome }
      }))
    };
  });

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-400">Mensagens</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Conversas com o Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe os feedbacks e mensagens trocadas sobre seus treinos.
        </p>
      </header>

      <AlunoFeedbacksClient conclusoes={conclusoesParaCliente} />
    </div>
  );
}
