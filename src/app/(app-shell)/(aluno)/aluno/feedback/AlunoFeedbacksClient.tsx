"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, MessageSquareText } from "lucide-react";

import { TipoUsuario } from "@/types/tipo-usuario";

type StatusAluno = "enviado" | "lido" | "respondido";

type TreinoMensagemParaAluno = {
  id: number;
  texto: string;
  criadoEmIso: string;
  lidoPeloAlunoEmIso: string | null;
  lidoPeloCoachEmIso: string | null;
  autor: {
    tipo: TipoUsuario;
    nome: string | null;
  };
};

type TreinoConclusaoParaAluno = {
  id: number;
  treinoId: string;
  treino: {
    id: string;
    titulo: string;
    dataTreinoIso: string;
  };
  tipoInteracao: "feedback" | "mensagem";
  totalMensagens: number;
  mensagens: TreinoMensagemParaAluno[];
};

type Props = {
  conclusoes: TreinoConclusaoParaAluno[];
};

function isCoachOuAdmin(tipo: TipoUsuario) {
  return tipo === TipoUsuario.Coach || tipo === TipoUsuario.Admin;
}

function resolveStatusParaAluno(conclusao: TreinoConclusaoParaAluno): StatusAluno {
  if (!conclusao.mensagens.length) return "enviado";

  const mensagens = conclusao.mensagens;
  const ultima = mensagens[mensagens.length - 1];
  const temNaoLidasDoAluno = mensagens.some(
    (mensagem) => mensagem.autor.tipo === TipoUsuario.Aluno && !mensagem.lidoPeloCoachEmIso
  );

  if (isCoachOuAdmin(ultima.autor.tipo)) {
    return "respondido";
  }

  if (temNaoLidasDoAluno) {
    return "enviado";
  }

  return "lido";
}

function temRespostaNaoLidaParaAluno(conclusao: TreinoConclusaoParaAluno): boolean {
  return conclusao.mensagens.some(
    (mensagem) => isCoachOuAdmin(mensagem.autor.tipo) && !mensagem.lidoPeloAlunoEmIso
  );
}

function formatPreview(texto: string | null) {
  if (!texto) return "Sem mensagens ainda.";
  return texto.length > 120 ? `${texto.slice(0, 117)}...` : texto;
}

export function AlunoFeedbacksClient({ conclusoes }: Props) {
  if (!conclusoes.length) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-24">
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center text-sm text-muted-foreground">
          Nenhuma conversa no momento. Quando você enviar um feedback sobre um treino, ele aparecerá aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-24 space-y-4">
      {conclusoes.map((conclusao) => {
        const dataTreino = new Date(conclusao.treino.dataTreinoIso);
        const dataTreinoLabel = !Number.isNaN(dataTreino.getTime())
          ? dataTreino.toLocaleDateString("pt-BR", { dateStyle: "medium" })
          : "Data não informada";

        const ultimaMensagem = conclusao.mensagens[conclusao.mensagens.length - 1] ?? null;
        const ultimaAtividadeDate = ultimaMensagem
          ? new Date(ultimaMensagem.criadoEmIso)
          : dataTreino;
        const ultimaAtividadeRelativa = formatDistanceToNow(ultimaAtividadeDate, {
          addSuffix: true,
          locale: ptBR
        });

        const status = resolveStatusParaAluno(conclusao);
        const respostaNaoLida = temRespostaNaoLidaParaAluno(conclusao);

        const statusStyles = {
          enviado: {
            label: "Enviado",
            className: "border-amber-400/30 bg-amber-400/10 text-amber-200"
          },
          lido: {
            label: "Visto",
            className: "border-sky-400/30 bg-sky-400/10 text-sky-200"
          },
          respondido: {
            label: respostaNaoLida ? "Nova resposta" : "Respondido",
            className: respostaNaoLida
              ? "border-orange-400/30 bg-orange-400/10 text-orange-200"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          }
        } as const;

        const { className: statusClass, label: statusLabel } = statusStyles[status];

        // Badge de tipo de interação
        const isFeedback = conclusao.tipoInteracao === "feedback";
        const tipoStyles = isFeedback
          ? { label: "Feedback", className: "border-purple-400/30 bg-purple-400/10 text-purple-200", Icon: MessageSquareText }
          : { label: "Conversa", className: "border-blue-400/30 bg-blue-400/10 text-blue-200", Icon: MessageCircle };

        // Preview da última mensagem
        const autorPrefixo = ultimaMensagem
          ? (ultimaMensagem.autor.tipo === TipoUsuario.Aluno ? "Você" : (ultimaMensagem.autor.nome || "Coach"))
          : null;

        return (
          <Link
            key={conclusao.id}
            href={`/aluno/feedback/${conclusao.id}`}
            className="block rounded-3xl border border-white/10 bg-black/40 p-5 transition hover:border-orange-500/60 hover:bg-black/60"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-400">{dataTreinoLabel}</p>
                  <h3 className="text-lg font-semibold text-foreground">{conclusao.treino.titulo}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Indicador de nova resposta */}
                  {respostaNaoLida && (
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                  )}
                  {/* Badge de tipo (Feedback ou Conversa) */}
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tipoStyles.className}`}>
                    <tipoStyles.Icon className="w-3 h-3" />
                    {tipoStyles.label}
                  </span>
                  {/* Badge de status */}
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              {ultimaMensagem && (
                <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Última mensagem</p>
                  <p className="mt-1 text-sm text-foreground">
                    <span className="font-semibold text-orange-300">{autorPrefixo}</span>
                    <span className="text-muted-foreground"> • {new Date(ultimaMensagem.criadoEmIso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{formatPreview(ultimaMensagem.texto)}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Atualizado {ultimaAtividadeRelativa}</p>
                {conclusao.totalMensagens > 1 && (
                  <span className="text-[11px] text-zinc-500">{conclusao.totalMensagens} mensagens</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
