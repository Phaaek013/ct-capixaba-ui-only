"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  texto: string;
  criadoEmISO: string;
  autorNome: string;
  autorTipo: string;
  isMine: boolean;
};

type CoachFeedbackChatClientProps = {
  coachId: number;
  treinoId: string;
  treinoTitulo: string;
  alunoId: number;
  alunoNome: string;
  mensagensIniciais: ChatMessage[];
};

function normalizeMensagemApi(raw: any, coachId: number): ChatMessage {
  return {
    id: raw?.id ?? Math.random(),
    texto: raw?.texto ?? "",
    criadoEmISO: raw?.criadoEm ?? raw?.criadoEmISO ?? new Date().toISOString(),
    autorNome: raw?.autor?.nome ?? raw?.autorNome ?? "Sem nome",
    autorTipo: raw?.autor?.tipo ?? raw?.autorTipo ?? "Desconhecido",
    isMine: (raw?.autor?.id ?? raw?.autorId) === coachId
  };
}

export default function CoachFeedbackChatClient({
  coachId,
  treinoId,
  treinoTitulo,
  alunoId,
  alunoNome,
  mensagensIniciais
}: CoachFeedbackChatClientProps) {
  const router = useRouter();
  const [mensagens, setMensagens] = useState<ChatMessage[]>(mensagensIniciais);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isEnviando, setIsEnviando] = useState(false);
  const [isAtualizando, setIsAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  const carregarMensagens = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setIsAtualizando(true);
    }
    setErro(null);
    try {
      const query = new URLSearchParams({ alunoId: String(alunoId) });
      const response = await fetch(`/api/treinos/${encodeURIComponent(treinoId)}/mensagens?${query.toString()}`, {
        method: "GET",
        credentials: "include"
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? payload?.message ?? "Não foi possível carregar as mensagens.");
      }
      const lista = Array.isArray(payload?.mensagens) ? payload.mensagens : [];
      setMensagens(lista.map((msg: any) => normalizeMensagemApi(msg, coachId)));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao atualizar mensagens.");
    } finally {
      if (!silent) {
        setIsAtualizando(false);
      }
    }
  }, [alunoId, coachId, treinoId]);

  useEffect(() => {
    setMensagens(mensagensIniciais);
  }, [mensagensIniciais]);

  useEffect(() => {
    carregarMensagens({ silent: true })
      .then(() => {
        router.refresh();
      })
      .catch(() => {
        // erro já tratado dentro de carregarMensagens
      });
  }, [carregarMensagens, router]);

  const handleVoltar = useCallback(() => {
    router.replace(`/coach/feedbacks?fromChat=${Date.now()}`);
  }, [router]);

  async function handleEnviarMensagem(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const texto = novaMensagem.trim();
    if (!texto || isEnviando) return;

    setIsEnviando(true);
    setErro(null);
    try {
      const response = await fetch(`/api/treinos/${encodeURIComponent(treinoId)}/mensagens?alunoId=${alunoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ texto })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error ?? payload?.message ?? "Não foi possível enviar a mensagem.");
      }

      if (payload?.mensagem) {
        const normalizada = normalizeMensagemApi(payload.mensagem, coachId);
        setMensagens((prev) => [...prev, normalizada]);
      } else if (Array.isArray(payload?.mensagens)) {
        setMensagens(payload.mensagens.map((msg: any) => normalizeMensagemApi(msg, coachId)));
      } else {
        await carregarMensagens();
      }

      setNovaMensagem("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao enviar mensagem.");
    } finally {
      setIsEnviando(false);
    }
  }

  function formatHora(iso: string) {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleVoltar}
            className="inline-flex items-center gap-2 rounded-full border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para feedbacks</span>
          </Button>

          <div>
            <h1 className="text-xl font-semibold text-zinc-50 sm:text-2xl">{treinoTitulo}</h1>
            <p className="text-sm text-zinc-400">Conversa com {alunoNome}</p>
          </div>
        </div>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
          {erro}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-black/40 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-muted-foreground">Histórico</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => carregarMensagens()}
            disabled={isAtualizando}
            className="rounded-2xl border-zinc-700 bg-zinc-900/80 text-xs text-zinc-100 hover:bg-zinc-800"
          >
            {isAtualizando ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>

        <div className="max-h-[380px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
          {mensagens.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda. Responda o aluno para iniciar a conversa.</p>
          )}

          {mensagens.map((mensagem) => (
            <div key={mensagem.id} className={cn("flex w-full", mensagem.isMine ? "justify-end" : "justify-start")}> 
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow",
                  mensagem.isMine ? "bg-orange-500 text-black" : "bg-white/5 text-foreground"
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold opacity-80">{mensagem.isMine ? "Você" : mensagem.autorNome}</span>
                  <span className="text-[11px] opacity-70">{formatHora(mensagem.criadoEmISO)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line">{mensagem.texto}</p>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleEnviarMensagem} className="mt-2 flex flex-col gap-2 border-t border-zinc-800 pt-4">
          <span className="text-xs text-zinc-500">Envie uma mensagem rápida para o aluno sobre este treino.</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              className="flex-1 min-h-[56px] max-h-[128px] resize-none rounded-2xl border border-orange-500/70 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Digite sua resposta aqui..."
              rows={3}
              value={novaMensagem}
              onChange={(event) => setNovaMensagem(event.target.value)}
              disabled={isEnviando}
            />
            <Button
              type="submit"
              disabled={isEnviando || !novaMensagem.trim()}
              className="w-full rounded-2xl bg-orange-500 px-6 py-2 text-sm font-semibold text-black shadow-[0_0_18px_rgba(249,115,22,0.45)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isEnviando ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
