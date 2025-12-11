"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTituloFromBlocos, type BlocosTreino } from "@/lib/treino-conteudo";

// DTO que vem da API /api/aluno/treinos
type TreinoAlunoDto = {
  id: number;
  dataTreino: string | null;
  conteudo: BlocosTreino;
  videoUrl: string | null;
  nomeModelo: string | null;
  coach?: { id: number; nome: string } | null;
};

type Props = {
  dataHoje: string; // "yyyy-MM-dd"
};

export default function TreinoHojeAlunoClient({ dataHoje }: Props) {
  const [treino, setTreino] = useState<TreinoAlunoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTreinoHoje() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/aluno/treinos?data=${dataHoje}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Erro ao carregar treino de hoje");
      }

      const data = (await res.json()) as TreinoAlunoDto[];

      // Assumindo no máximo 1 treino por aluno/dia; se vier mais, pega o primeiro
      setTreino(data[0] ?? null);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro ao carregar treino de hoje";
      setError(message);
      setTreino(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTreinoHoje();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataHoje]);

  const labelData = format(parseISO(`${dataHoje}T12:00:00`), "EEEE, d 'de' MMMM", {
    locale: ptBR,
  });

  // Estado: carregando
  if (loading) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">Carregando treino de hoje…</p>
        <Card className="bg-black/40 border-zinc-800 p-4 space-y-3 animate-pulse">
          <div className="h-5 w-1/2 bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        </Card>
      </div>
    );
  }

  // Estado: erro
  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-400">{error}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadTreinoHoje}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Estado: sem treino
  if (!treino) {
    return (
      <Card className="bg-black/40 border-zinc-800 p-6 text-center space-y-2">
        <p className="text-sm text-zinc-400">
          Nenhum treino cadastrado para hoje.
        </p>
        <p className="text-xs text-zinc-500">
          {labelData}
        </p>
        <p className="text-xs text-zinc-600 pt-2">
          Fale com o seu coach caso ache que isso é um erro.
        </p>
      </Card>
    );
  }

  // Estado: treino encontrado
  const { conteudo, videoUrl, nomeModelo } = treino;
  const titulo = getTituloFromBlocos(conteudo, nomeModelo);

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border-zinc-800 p-4 space-y-5">
        {/* Header do treino */}
        <div className="space-y-1 border-b border-zinc-800 pb-4">
          <p className="text-xs uppercase tracking-wide text-orange-400">
            {labelData}
          </p>
          <h2 className="text-xl font-bold text-zinc-50">{titulo}</h2>
          {conteudo.foco && conteudo.foco !== titulo && (
            <p className="text-sm text-zinc-300">{conteudo.foco}</p>
          )}
        </div>

        {/* Blocos do treino */}
        <div className="space-y-4 text-sm text-zinc-200">
          {conteudo.mobilidade && (
            <BlocoTreino titulo="Mobilidade" conteudo={conteudo.mobilidade} />
          )}

          {conteudo.aquecimento && (
            <BlocoTreino titulo="Aquecimento / Ativação" conteudo={conteudo.aquecimento} />
          )}

          {conteudo.skillForca && (
            <BlocoTreino titulo="Skill / Força" conteudo={conteudo.skillForca} />
          )}

          {conteudo.wod && (
            <BlocoTreino titulo="WOD" conteudo={conteudo.wod} destaque />
          )}

          {conteudo.alongamento && (
            <BlocoTreino titulo="Alongamento" conteudo={conteudo.alongamento} />
          )}
        </div>

        {/* Vídeo de referência */}
        {videoUrl && (
          <div className="pt-2 border-t border-zinc-800">
            <Button asChild variant="outline" size="sm">
              <a href={videoUrl} target="_blank" rel="noreferrer">
                Ver vídeo de referência
              </a>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// Componente auxiliar para cada bloco do treino
function BlocoTreino({
  titulo,
  conteudo,
  destaque = false,
}: {
  titulo: string;
  conteudo: string;
  destaque?: boolean;
}) {
  return (
    <section className={destaque ? "bg-zinc-900/50 -mx-4 px-4 py-3 rounded-lg" : ""}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
        destaque ? "text-orange-400" : "text-zinc-500"
      }`}>
        {titulo}
      </p>
      <p className="whitespace-pre-line leading-relaxed">{conteudo}</p>
    </section>
  );
}
