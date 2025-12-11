"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getTituloFromBlocos, type BlocosTreino } from "@/lib/treino-conteudo";

type TreinoAlunoDto = {
  id: number;
  dataTreino: string | null;
  conteudo: BlocosTreino;
  videoUrl: string | null;
  nomeModelo: string | null;
};

type Props = {
  dataHoje: string; // "yyyy-MM-dd"
  alunoId: number;
};

export default function TreinoHojeResumoAlunoClient({ dataHoje, alunoId }: Props) {
  const router = useRouter();
  const [treino, setTreino] = useState<TreinoAlunoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  async function loadTreinoHoje() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/aluno/treinos?data=${dataHoje}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Erro ao carregar treino de hoje");

      const data = (await res.json()) as TreinoAlunoDto[];
      const treinoHoje = data[0] ?? null;
      setTreino(treinoHoje);

      // Verifica se já foi concluído
      if (treinoHoje) {
        try {
          const concRes = await fetch(`/api/treinos/${treinoHoje.id}/mensagens`, {
            cache: "no-store",
          });
          if (concRes.ok) {
            const concData = await concRes.json();
            setConcluido(Boolean(concData?.treinoConclusaoId || concData?.jaConcluido));
          }
        } catch {
          // Ignora erro de verificação de conclusão
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao carregar treino de hoje");
      setTreino(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTreinoHoje();
  }, [dataHoje]);

  const dataLabel = format(parseISO(`${dataHoje}T00:00:00`), "d 'de' MMMM", {
    locale: ptBR,
  });

  if (loading) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 md:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-1/3 rounded bg-zinc-700" />
          <div className="h-6 w-2/3 rounded bg-zinc-700" />
          <div className="h-4 w-1/2 rounded bg-zinc-700" />
          <div className="h-12 w-full rounded-full bg-zinc-700 mt-4" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-500/40 bg-zinc-900/80 p-4 md:p-6 space-y-3">
        <p className="text-sm text-red-400">{error}</p>
        <Button variant="secondary" size="sm" onClick={loadTreinoHoje}>
          Tentar novamente
        </Button>
      </section>
    );
  }

  if (!treino) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Treino de hoje
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              Nenhum treino disponível
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu coach ainda não cadastrou um treino para hoje ({dataLabel}).
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { conteudo, nomeModelo } = treino;
  const titulo = getTituloFromBlocos(conteudo, nomeModelo) || "Treino de hoje";
  const foco = conteudo.foco;

  const treinoButtonLabel = concluido ? "Ver treino e feedback" : "Ver treino completo";

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Treino disponível para iniciar
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">
            {titulo}
          </h2>
          {foco && (
            <p className="mt-2 text-sm text-muted-foreground">
              Foco: {foco}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {concluido
              ? "Você já concluiu esse treino. Pode revisitar os detalhes ou ajustar seu feedback."
              : "Veja a divisão completa do treino e marque como concluído ao final da sessão."}
          </p>
        </div>

        {concluido && (
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            Treino concluído
          </span>
        )}
      </div>

      <Button
        type="button"
        onClick={() => router.push(`/aluno/treinos/${treino.id}`)}
        className="mt-6 w-full rounded-full bg-orange-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-orange-700"
      >
        {treinoButtonLabel}
      </Button>
    </section>
  );
}
