"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TipoUsuario } from "@/types/tipo-usuario";

import clsx from "clsx";

type MensagemDTO = {
  id: number;
  texto: string;
  criadoEm: string;
  lidoPeloAlunoEm: string | null;
  lidoPeloCoachEm: string | null;
  autor: {
    id: number;
    nome: string | null;
    tipo: TipoUsuario;
    avatarUrl: string | null;
  };
};

type MensagensResponse = {
  treinoConclusaoId: number | null;
  mensagens: MensagemDTO[];
  marcouMensagensDoCoachComoLidas?: boolean;
};

interface Props {
  treinoId: string;
  treinoConclusaoId: number;
  tituloTreino: string;
  dataTreino: string;
}

export function AlunoFeedbackChatClient({
  treinoId,
  treinoConclusaoId,
  tituloTreino,
  dataTreino
}: Props) {
  const router = useRouter();
  const [mensagens, setMensagens] = useState<MensagemDTO[]>([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  const carregarMensagens = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);

        const response = await fetch(`/api/treinos/${treinoId}/mensagens`, {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Erro ao carregar mensagens");
        }

        const data = (await response.json()) as MensagensResponse;
        setMensagens(data.mensagens ?? []);
        setErro(null);

        if (data.marcouMensagensDoCoachComoLidas) {
          router.refresh();
        }
      } catch (error) {
        console.error("Erro inesperado ao carregar mensagens", error);
        setErro("Não foi possível carregar as mensagens agora.");
      } finally {
        if (showLoading) setIsLoading(false);
        scrollToBottom();
      }
    },
    [router, scrollToBottom, treinoId]
  );

  useEffect(() => {
    carregarMensagens(true);
  }, [carregarMensagens]);

  const handleEnviarMensagem = async () => {
    const texto = novoTexto.trim();
    if (!texto) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/treinos/${treinoId}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ texto })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro ao enviar mensagem");
      }

      setNovoTexto("");
      await carregarMensagens(false);
    } catch (error) {
      console.error("Erro inesperado ao enviar mensagem", error);
      setErro("Não foi possível enviar sua mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVoltar = () => {
    router.replace(`/aluno/feedback?fromChat=${Date.now()}`);
  };

  const dataTreinoLabel = new Date(dataTreino).toLocaleDateString("pt-BR");

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <Button type="button" variant="ghost" className="flex items-center gap-2 px-0" onClick={handleVoltar}>
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>

        <div className="text-right">
          <p className="text-sm font-medium text-zinc-200">{tituloTreino}</p>
          <p className="text-xs text-zinc-500">{dataTreinoLabel}</p>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-3xl border border-white/5 bg-black/60 p-4">
        <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl bg-black/40 p-4">
          {isLoading && mensagens.length === 0 && <p className="text-xs text-zinc-500">Carregando conversa…</p>}
          {erro && <p className="text-xs text-red-400">{erro}</p>}

          {mensagens.map((mensagem) => {
            const isAluno = mensagem.autor.tipo === TipoUsuario.Aluno;
            const dataLabel = new Date(mensagem.criadoEm).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short"
            });

            return (
              <div key={mensagem.id} className={clsx("flex w-full", isAluno ? "justify-end" : "justify-start")}>
                <div
                  className={clsx(
                    "flex max-w-[80%] flex-col gap-1 rounded-3xl px-4 py-2 text-sm",
                    isAluno ? "bg-orange-500 text-black" : "bg-white/5 text-zinc-100"
                  )}
                >
                  <span className="text-[11px] font-semibold opacity-80">
                    {isAluno ? "Você" : mensagem.autor.nome ?? "Coach"}
                  </span>
                  <p className="whitespace-pre-wrap text-sm">{mensagem.texto}</p>
                  <span className="text-[10px] opacity-70">{dataLabel}</span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={novoTexto}
            onChange={(event) => setNovoTexto(event.target.value)}
            placeholder="Envie uma dúvida rápida sobre este treino…"
            className="flex-1 rounded-full border border-zinc-700 bg-black/40 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isSending}
          />
          <Button type="button" onClick={handleEnviarMensagem} disabled={isSending}>
            {isSending ? "Enviando…" : "Enviar"}
          </Button>
        </div>
      </div>
    </section>
  );
}
