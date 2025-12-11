import { prisma } from "@/lib/prisma";
import { assertCoach } from "@/lib/roles";
import { TipoUsuario } from "@/types/tipo-usuario";
import { parseConteudo, getTituloFromBlocos } from "@/lib/treino-conteudo";
import { CoachFeedbacksClient, type CoachFeedbackSummary } from "./CoachFeedbacksClient";

export const revalidate = 0;

export default async function CoachFeedbacksPage() {
  const session = await assertCoach();

  // Apenas conclusões que têm pelo menos uma mensagem aparecem como thread
  const conclusoes = await prisma.treinoConclusao.findMany({
    where: {
      mensagens: {
        some: {} // Filtra apenas conclusões com mensagens
      }
    },
    orderBy: { dataConclusao: "desc" },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, avatarUrl: true }
      },
      mensagens: {
        orderBy: { criadoEm: "asc" },
        include: {
          autor: {
            select: { id: true, nome: true, tipo: true }
          }
        }
      },
      _count: {
        select: { mensagens: true }
      }
    }
  });

  // Busca os treinos correspondentes para pegar os títulos reais
  const treinoIds = conclusoes
    .map(c => Number(c.treinoId))
    .filter(id => !Number.isNaN(id));
  
  const treinos = await prisma.treino.findMany({
    where: { id: { in: treinoIds } },
    select: { id: true, conteudo: true, nomeModelo: true }
  });
  
  const treinoMap = new Map(treinos.map(t => [String(t.id), t]));

  const conclusoesOrdenadas = conclusoes
    .map((conclusao) => {
      const ultimaMensagem = conclusao.mensagens[conclusao.mensagens.length - 1] ?? null;
      const referencia = ultimaMensagem?.criadoEm ?? conclusao.dataConclusao;
      return {
        referencia,
        conclusao
      };
    })
    .sort((a, b) => b.referencia.getTime() - a.referencia.getTime())
    .map((item) => item.conclusao);

  const feedbacks: CoachFeedbackSummary[] = conclusoesOrdenadas.map((conclusao) => {
    // Buscar título do treino real
    const treino = treinoMap.get(conclusao.treinoId);
    let treinoTitulo = `Treino ${conclusao.treinoId}`;
    if (treino) {
      const blocos = parseConteudo(treino.conteudo);
      treinoTitulo = getTituloFromBlocos(blocos, treino.nomeModelo) || treinoTitulo;
    }

    const ultimaMensagem = conclusao.mensagens[conclusao.mensagens.length - 1] ?? null;
    const totalMensagens = conclusao._count.mensagens;

    // Determinar tipo de interação:
    // - Se tem só 1 mensagem e é do aluno = "feedback" (feedback inicial da conclusão)
    // - Se tem mais mensagens ou última não é do aluno = "mensagem" (virou conversa)
    const mensagensDoAluno = conclusao.mensagens.filter(
      m => m.autor.tipo === TipoUsuario.Aluno
    );
    const isSoFeedbackInicial = totalMensagens === 1 && mensagensDoAluno.length === 1;
    const tipoInteracao: "feedback" | "mensagem" = isSoFeedbackInicial ? "feedback" : "mensagem";

    const ultimaMensagemTexto = ultimaMensagem?.texto ?? conclusao.feedbackText ?? null;
    const ultimaMensagemAutorNome = ultimaMensagem?.autor.nome ?? (conclusao.feedbackText ? conclusao.usuario.nome : null);
    const ultimaMensagemCriadoEm = ultimaMensagem?.criadoEm ?? conclusao.dataConclusao;
    const temNaoLidasDoAluno = conclusao.mensagens.some(
      (mensagem) => mensagem.autor.tipo === TipoUsuario.Aluno && mensagem.lidoPeloCoachEm == null
    );

    let status: CoachFeedbackSummary["status"] = "pendente";
    if (!temNaoLidasDoAluno) {
      if (ultimaMensagem && [TipoUsuario.Coach, TipoUsuario.Admin].includes(ultimaMensagem.autor.tipo as TipoUsuario)) {
        status = "respondido";
      } else if (ultimaMensagem) {
        status = "lido";
      }
    }

    return {
      treinoConclusaoId: conclusao.id,
      treinoId: conclusao.treinoId,
      alunoId: conclusao.usuario.id,
      alunoNome: conclusao.usuario.nome,
      alunoEmail: conclusao.usuario.email,
      alunoAvatarUrl: conclusao.usuario.avatarUrl,
      treinoTitulo,
      tipoInteracao,
      totalMensagens,
      dataConclusaoIso: conclusao.dataConclusao.toISOString(),
      ultimaMensagemTexto,
      ultimaMensagemAutorNome,
      ultimaMensagemCriadoEmIso: ultimaMensagemCriadoEm.toISOString(),
      ultimaAtividadeIso: ultimaMensagemCriadoEm.toISOString(),
      status
    } satisfies CoachFeedbackSummary;
  });

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-400">Feedbacks</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Mensagens dos alunos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe dúvidas e respostas trocadas após cada treino e mantenha os alunos sempre acolhidos.
        </p>
      </header>

      <CoachFeedbacksClient feedbacks={feedbacks} />
    </div>
  );
}
