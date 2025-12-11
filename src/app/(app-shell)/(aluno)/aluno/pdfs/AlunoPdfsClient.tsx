"use client";

import type { PdfDocumento } from "@prisma/client";

type Props = {
  pdfs: PdfDocumento[];
};

export function AlunoPdfsClient({ pdfs }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-28">
      <header className="mb-4 space-y-1">
        <p className="text-[10px] tracking-[0.3em] text-amber-500 uppercase">Área do aluno</p>
        <h1 className="text-2xl font-semibold text-zinc-50">Documentos importantes</h1>
        <p className="mt-1 text-sm text-zinc-400">Acesse PDFs enviados pelo seu coach.</p>
      </header>

      {pdfs.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Ainda não há documentos disponíveis. Assim que o coach enviar novos PDFs, eles aparecerão aqui.
        </p>
      ) : (
        <section className="space-y-4">
          {pdfs.map((pdf) => (
            <article
              key={pdf.id}
              className="w-full rounded-3xl bg-[#111111] px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-500">
                  <span className="text-xs font-semibold tracking-[0.3em] text-amber-500">PDF</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-50">{pdf.titulo}</span>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">{pdf.descricao ?? "CT CAPIXABA"}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <a
                  href={pdf.arquivoPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black text-center shadow-lg shadow-amber-500/40 hover:bg-amber-400"
                >
                  Abrir PDF
                </a>
                <a
                  href={pdf.arquivoPath}
                  download
                  className="flex-1 sm:flex-none rounded-full bg-zinc-800 px-5 py-2 text-sm font-semibold text-zinc-50 text-center hover:bg-zinc-700"
                >
                  Baixar PDF
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
