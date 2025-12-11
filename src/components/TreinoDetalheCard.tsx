"use client";

import { Card } from "@/components/ui/card";
import type { BlocosTreino } from "@/lib/treino-conteudo";

type TreinoDetalheCardProps = {
  blocos: BlocosTreino;
  videoUrl?: string | null;
  titulo?: string;
  /** Se true, exibe versão compacta sem vídeo */
  compact?: boolean;
};

/**
 * Componente reutilizável que renderiza os blocos de um treino.
 * Usado pelo aluno (visualização completa) e pelo coach (preview).
 */
export function TreinoDetalheCard({
  blocos,
  videoUrl,
  titulo,
  compact = false,
}: TreinoDetalheCardProps) {
  return (
    <section className="space-y-4">
      {/* Vídeo de referência (apenas se não for compact) */}
      {!compact && videoUrl && (
        <Card className="overflow-hidden bg-black/40">
          <div className="aspect-video w-full bg-black/60">
            <iframe
              src={videoUrl.replace("watch?v=", "embed/")}
              title={titulo ?? "Vídeo do treino"}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">Assista ao vídeo antes de iniciar o treino.</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-orange-500 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Abrir no YouTube
            </a>
          </div>
        </Card>
      )}

      {/* Blocos do treino */}
      {blocos.mobilidade && (
        <Card className="space-y-2 bg-black/40 px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Mobilidade
          </h2>
          <p className="whitespace-pre-line text-sm text-zinc-200">{blocos.mobilidade}</p>
        </Card>
      )}

      {blocos.aquecimento && (
        <Card className="space-y-2 bg-black/40 px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Aquecimento / Ativação
          </h2>
          <p className="whitespace-pre-line text-sm text-zinc-200">{blocos.aquecimento}</p>
        </Card>
      )}

      {blocos.skillForca && (
        <Card className="space-y-2 bg-black/40 px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Skill / Força
          </h2>
          <p className="whitespace-pre-line text-sm text-zinc-200">{blocos.skillForca}</p>
        </Card>
      )}

      {blocos.wod && (
        <Card className="space-y-2 bg-black/40 px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            WOD
          </h2>
          <p className="whitespace-pre-line text-sm text-zinc-200">{blocos.wod}</p>
        </Card>
      )}

      {blocos.alongamento && (
        <Card className="space-y-2 bg-black/40 px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-400">
            Alongamento
          </h2>
          <p className="whitespace-pre-line text-sm text-zinc-200">{blocos.alongamento}</p>
        </Card>
      )}
    </section>
  );
}
