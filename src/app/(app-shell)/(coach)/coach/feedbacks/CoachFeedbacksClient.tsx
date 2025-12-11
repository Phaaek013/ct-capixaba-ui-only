"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, MessageSquareText } from "lucide-react";

export type CoachFeedbackSummary = {
  treinoConclusaoId: number;
  treinoId: string;
  alunoId: number;
  alunoNome: string;
  alunoEmail: string | null;
  alunoAvatarUrl: string | null;
  treinoTitulo: string;
  tipoInteracao: "feedback" | "mensagem";
  totalMensagens: number;
  dataConclusaoIso: string;
  ultimaMensagemTexto: string | null;
  ultimaMensagemAutorNome: string | null;
  ultimaMensagemCriadoEmIso: string | null;
  ultimaAtividadeIso: string;
  status: "pendente" | "lido" | "respondido";
};

type CoachFeedbacksClientProps = {
  feedbacks: CoachFeedbackSummary[];
};

function formatPreview(texto: string | null) {
  if (!texto) return "Sem mensagens ainda.";
  return texto.length > 160 ? `${texto.slice(0, 157)}...` : texto;
}

export function CoachFeedbacksClient({ feedbacks }: CoachFeedbacksClientProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-24">
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center text-sm text-muted-foreground">
          Nenhum feedback disponível no momento. Quando um aluno iniciar uma conversa sobre um treino, ele aparecerá aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-24 space-y-4">
      {feedbacks.map((feedback) => {
        const dataConclusao = new Date(feedback.dataConclusaoIso).toLocaleDateString("pt-BR", { dateStyle: "medium" });
        const ultimaAtividadeRelativa = formatDistanceToNow(new Date(feedback.ultimaAtividadeIso), {
          addSuffix: true,
          locale: ptBR
        });
        const statusStyles = {
          pendente: {
            label: "Pendente",
            className: "border-amber-400/30 bg-amber-400/10 text-amber-200"
          },
          lido: {
            label: "Lido",
            className: "border-sky-400/30 bg-sky-400/10 text-sky-200"
          },
          respondido: {
            label: "Respondido",
            className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          }
        } as const;

        const { className: statusClass, label: statusLabel } = statusStyles[feedback.status];
        
        // Badge de tipo de interação
        const isFeedback = feedback.tipoInteracao === "feedback";
        const tipoStyles = isFeedback
          ? { label: "Feedback", className: "border-purple-400/30 bg-purple-400/10 text-purple-200", Icon: MessageSquareText }
          : { label: "Conversa", className: "border-blue-400/30 bg-blue-400/10 text-blue-200", Icon: MessageCircle };

        return (
          <Link
            key={`${feedback.treinoConclusaoId}-${feedback.treinoId}`}
            href={`/coach/feedbacks/${feedback.treinoId}?alunoId=${feedback.alunoId}`}
            className="block rounded-3xl border border-white/10 bg-black/40 p-5 transition hover:border-orange-500/60 hover:bg-black/60"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-400">{dataConclusao}</p>
                  <h3 className="text-lg font-semibold text-foreground">{feedback.alunoNome}</h3>
                  <p className="text-sm text-muted-foreground">{feedback.treinoTitulo}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
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

              <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Última mensagem</p>
                <p className="mt-1 text-sm text-foreground">
                  <span className="font-semibold text-orange-300">{feedback.ultimaMensagemAutorNome ?? "Aluno"}</span>
                  <span className="text-muted-foreground"> • {feedback.ultimaMensagemCriadoEmIso ? new Date(feedback.ultimaMensagemCriadoEmIso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Sem data"}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{formatPreview(feedback.ultimaMensagemTexto)}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Atualizado {ultimaAtividadeRelativa}</p>
                {feedback.totalMensagens > 1 && (
                  <span className="text-[11px] text-zinc-500">{feedback.totalMensagens} mensagens</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
