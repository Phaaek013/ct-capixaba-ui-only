"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

type ConclusaoInicial = {
  feedbackText: string;
  dataConclusao: string;
};

export type ConversaMensagem = {
  id: number;
  autorId: number;
  autorTipo: string;
  autorNome: string;
  autorAvatarUrl: string | null;
  mensagem: string;
  createdAtIso: string;
};

type MensagemApiPayload = {
  id: number;
  texto?: string | null;
  criadoEm?: string | null;
  lidoPeloAlunoEm?: string | null;
  lidoPeloCoachEm?: string | null;
  autor?: {
    id?: number | null;
    nome?: string | null;
    avatarUrl?: string | null;
    tipo?: string | null;
  } | null;
};

function normalizarMensagemApi(mensagem: MensagemApiPayload): ConversaMensagem {
  return {
    id: mensagem.id,
    autorId: mensagem.autor?.id ?? 0,
    autorTipo: mensagem.autor?.tipo ?? "Desconhecido",
    autorNome: mensagem.autor?.nome ?? "Coach",
    autorAvatarUrl: mensagem.autor?.avatarUrl ?? null,
    mensagem: mensagem.texto ?? "",
    createdAtIso: mensagem.criadoEm ?? new Date().toISOString()
  };
}

type WorkoutActionsClientProps = {
  treinoId: string;
  alunoId: number;
  jaConcluido?: boolean;
  conclusaoInicial?: ConclusaoInicial | null;
  mensagensIniciais?: ConversaMensagem[];
};

export function WorkoutActionsClient({
  treinoId,
  alunoId,
  jaConcluido = false,
  conclusaoInicial,
  mensagensIniciais = []
}: WorkoutActionsClientProps) {
  const router = useRouter();
  const [feedbackText, setFeedbackText] = useState(conclusaoInicial?.feedbackText ?? "");
  const [ultimaConclusao, setUltimaConclusao] = useState<string | null>(conclusaoInicial?.dataConclusao ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jaConcluidoLocal, setJaConcluidoLocal] = useState(Boolean(jaConcluido));

  const [mensagens, setMensagens] = useState<ConversaMensagem[]>(mensagensIniciais);
  const [mensagensErro, setMensagensErro] = useState<string | null>(null);
  const [isSincronizandoMensagens, setIsSincronizandoMensagens] = useState(false);
  const [mensagemDraft, setMensagemDraft] = useState("");
  const [isEnviandoMensagem, setIsEnviandoMensagem] = useState(false);
  const [feedbackErro, setFeedbackErro] = useState<string | null>(null);
  const mensagensEndRef = useRef<HTMLDivElement | null>(null);
  const mensagensContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFeedbackText(conclusaoInicial?.feedbackText ?? "");
    setUltimaConclusao(conclusaoInicial?.dataConclusao ?? null);
  }, [conclusaoInicial]);

  useEffect(() => {
    setJaConcluidoLocal(Boolean(jaConcluido));
  }, [jaConcluido]);

  useEffect(() => {
    setMensagens(mensagensIniciais);
  }, [mensagensIniciais]);

  // Scroll apenas dentro do container de mensagens, não na página inteira
  useEffect(() => {
    if (mensagensContainerRef.current) {
      mensagensContainerRef.current.scrollTop = mensagensContainerRef.current.scrollHeight;
    }
  }, [mensagens.length]);

  const sincronizarMensagens = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      if (showLoading) {
        setIsSincronizandoMensagens(true);
      }
      try {
        const response = await fetch(`/api/treinos/${treinoId}/mensagens`, {
          method: "GET",
          credentials: "include"
        });

        let payload: any = null;
        try {
          payload = await response.json();
        } catch (error) {
          payload = null;
        }

        if (!response.ok) {
          throw new Error(payload?.error ?? payload?.message ?? "Não foi possível carregar as mensagens.");
        }

        const lista: ConversaMensagem[] = Array.isArray(payload?.mensagens)
          ? payload.mensagens.map((mensagem: MensagemApiPayload) => normalizarMensagemApi(mensagem))
          : [];
        setMensagens(lista);
        setMensagensErro(null);
        setJaConcluidoLocal(Boolean(payload?.treinoConclusaoId ?? payload?.jaConcluido));
        if (payload?.ultimaConclusaoIso) {
          setUltimaConclusao(payload.ultimaConclusaoIso);
        }

        return { limpouMensagensDoCoach: Boolean(payload?.marcouMensagensDoCoachComoLidas) };
      } catch (error) {
        console.error("Erro ao sincronizar mensagens", error);
        setMensagensErro(error instanceof Error ? error.message : "Falha ao carregar mensagens.");
        return { limpouMensagensDoCoach: false };
      } finally {
        if (showLoading) {
          setIsSincronizandoMensagens(false);
        }
      }
    },
    [treinoId]
  );

  useEffect(() => {
    const init = async () => {
      const { limpouMensagensDoCoach } = await sincronizarMensagens({ showLoading: false });
      if (limpouMensagensDoCoach) {
        router.refresh();
      }
    };

    init();
  }, [router, sincronizarMensagens]);

  const handleAtualizarMensagens = useCallback(async () => {
    const { limpouMensagensDoCoach } = await sincronizarMensagens();
    if (limpouMensagensDoCoach) {
      router.refresh();
    }
  }, [router, sincronizarMensagens]);

  async function handleEnviarMensagem(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (isEnviandoMensagem) return;

    const texto = mensagemDraft.trim();
    if (!texto) {
      setMensagensErro("Digite uma mensagem antes de enviar.");
      return;
    }

    setIsEnviandoMensagem(true);
    try {
      const response = await fetch(`/api/treinos/${treinoId}/mensagens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ texto })
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }
      if (!response.ok) {
        throw new Error(payload?.error ?? payload?.message ?? "Não foi possível enviar sua mensagem.");
      }

      if (payload?.mensagem) {
        setMensagens((prev) => [...prev, normalizarMensagemApi(payload.mensagem as MensagemApiPayload)]);
      }
      setMensagemDraft("");
      setMensagensErro(null);
      setJaConcluidoLocal(true);
      if (payload?.ultimaConclusaoIso) {
        setUltimaConclusao(payload.ultimaConclusaoIso);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem", error);
      setMensagensErro(error instanceof Error ? error.message : "Falha ao enviar mensagem.");
    } finally {
      setIsEnviandoMensagem(false);
    }
  }

  async function handleSubmitConclusao() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackErro(null);

    try {
      const payload = {
        feedbackText: feedbackText.trim() || null
      };

      const response = await fetch(`/api/aluno/treinos/${treinoId}/concluir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!response.ok) {
        const erroResposta = await response.json().catch(() => null);
        throw new Error(erroResposta?.message ?? "Erro ao salvar seu feedback.");
      }

      setJaConcluidoLocal(true);
      const agora = new Date().toISOString();
      setUltimaConclusao(agora);
      router.refresh();
    } catch (error) {
      console.error("Erro ao concluir treino", error);
      setFeedbackErro((error as Error)?.message ?? "Não foi possível concluir o treino agora.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const buttonLabel = isSubmitting
    ? "Salvando..."
    : jaConcluidoLocal
      ? "Atualizar feedback"
      : "Enviar feedback e concluir treino";

  const conversaVazia = useMemo(() => mensagens.length === 0, [mensagens.length]);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Registrar feedback</h3>
        <p className="text-xs text-muted-foreground">Use este espaço para contar ao coach como foi o treino de hoje.</p>

        {jaConcluidoLocal && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            <p>Treino já concluído. Você pode ajustar seu feedback quando precisar.</p>
            {ultimaConclusao && (
              <p className="mt-1 text-[11px] text-emerald-100/80">
                Última atualização: {new Date(ultimaConclusao).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            )}
          </div>
        )}

        <textarea
          className="min-h-[96px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="Descreva como foi seu treino hoje, seus desafios e conquistas"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          disabled={isSubmitting}
        />
        {feedbackErro && <p className="text-xs text-red-400">{feedbackErro}</p>}

        <Button
          type="button"
          onClick={handleSubmitConclusao}
          disabled={isSubmitting}
          className="mt-4 w-full rounded-full bg-orange-500 text-base font-semibold text-black shadow-[0_0_24px_rgba(249,115,22,0.4)] hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {buttonLabel}
        </Button>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-black/40 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Conversa com o coach</h3>
            <p className="text-xs text-muted-foreground">Envie dúvidas rápidas sobre o treino e acompanhe o histórico.</p>
          </div>
          <Button
            type="button"
            onClick={handleAtualizarMensagens}
            variant="outline"
            size="sm"
            disabled={isSincronizandoMensagens}
            className="rounded-2xl border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-800"
          >
            {isSincronizandoMensagens ? "Sincronizando..." : "Atualizar"}
          </Button>
        </div>

        <div
          ref={mensagensContainerRef}
          className="max-h-[320px] min-h-[200px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/50 p-4"
        >
          {mensagensErro && (
            <p className="text-xs text-red-400">{mensagensErro}</p>
          )}

          {conversaVazia && !mensagensErro && (
            <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda. Envie a primeira e marque o treino como concluído automaticamente.</p>
          )}

          {mensagens.map((mensagem) => {
            const ehAluno = mensagem.autorId === alunoId;
            const bolhaClass = ehAluno
              ? "bg-orange-500 text-black"
              : "bg-white/5 text-foreground";
            const dataFormatada = new Date(mensagem.createdAtIso).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short"
            });

            return (
              <div key={mensagem.id} className={clsx("flex w-full", ehAluno ? "justify-end" : "justify-start")}> 
                <div className={clsx("flex max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2 text-sm", bolhaClass)}>
                  <span className="text-[11px] font-semibold opacity-70">
                    {ehAluno ? "Você" : mensagem.autorNome}
                  </span>
                  <p>{mensagem.mensagem}</p>
                  <span className="text-[11px] opacity-70">{dataFormatada}</span>
                </div>
              </div>
            );
          })}

          <div ref={mensagensEndRef} />
        </div>

        <form onSubmit={handleEnviarMensagem} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <textarea
            rows={2}
            className="min-h-[56px] flex-1 resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
            placeholder="Envie uma dúvida rápida sobre este treino."
            value={mensagemDraft}
            onChange={(event) => setMensagemDraft(event.target.value)}
            disabled={isEnviandoMensagem}
          />
          <Button
            type="submit"
            disabled={isEnviandoMensagem || mensagemDraft.trim().length === 0}
            variant="outline"
            className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900/80 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
          >
            {isEnviandoMensagem ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </form>
      </section>
    </div>
  );
}
