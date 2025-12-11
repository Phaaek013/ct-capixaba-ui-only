"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PdfCategory = "avaliacao" | "programacao" | "exames" | "outros";

type AlunoPdf = {
  id: string;
  title: string;
  description?: string;
  category: PdfCategory;
  uploadedAt: string;
  coachName?: string;
  url: string;
};

const MOCK_PDFS: AlunoPdf[] = [
  {
    id: "aval-inicial",
    title: "Avaliação física inicial",
    description: "Dados de composição corporal e testes de mobilidade.",
    category: "avaliacao",
    uploadedAt: "2025-12-01T10:00:00.000Z",
    coachName: "Coach Bruno",
    url: "/uploads/pdfs/avaliacao-inicial.pdf"
  },
  {
    id: "programacao-dezembro",
    title: "Programação de treinos - Dezembro",
    description: "Visão geral dos blocos de força e condicionamento do mês.",
    category: "programacao",
    uploadedAt: "2025-12-05T09:30:00.000Z",
    coachName: "Coach Bruno",
    url: "/uploads/pdfs/programacao-dezembro.pdf"
  },
  {
    id: "exames-ombro",
    title: "Exames de imagem - Ombro direito",
    description: "Laudo de ressonância para acompanhamento com o médico.",
    category: "exames",
    uploadedAt: "2025-11-20T14:15:00.000Z",
    url: "/uploads/pdfs/exames-ombro.pdf"
  }
];

function formatDate(dateIso: string) {
  try {
    return format(new Date(dateIso), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
  } catch {
    return "";
  }
}

export function MeusPdfsClient() {
  const [query, setQuery] = useState("");

  const filteredPdfs = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return MOCK_PDFS;

    return MOCK_PDFS.filter((pdf) => {
      return (
        pdf.title.toLowerCase().includes(q) ||
        (pdf.description && pdf.description.toLowerCase().includes(q))
      );
    });
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">PDFs</span>
        <h1 className="text-2xl font-bold text-foreground">Meus PDFs</h1>
        <p className="text-sm text-muted-foreground">Arquivos que o seu coach deixou disponíveis para você consultar.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            className="border-white/10 bg-black/40 pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredPdfs.length === 0
            ? "Nenhum arquivo encontrado."
            : filteredPdfs.length === 1
              ? "1 arquivo encontrado."
              : `${filteredPdfs.length} arquivos encontrados.`}
        </p>
      </div>

      {filteredPdfs.length === 0 ? (
        <Card className="border border-white/5 bg-black/40 px-4 py-6 text-sm text-muted-foreground">
          Nenhum PDF disponível no momento. Assim que o coach enviar algum arquivo para você, ele aparecerá aqui.
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPdfs.map((pdf) => (
            <Card
              key={pdf.id}
              className="flex flex-col gap-3 border border-white/5 bg-black/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/60 bg-black/60 text-orange-400">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-foreground">{pdf.title}</h2>
                  {pdf.description && <p className="text-xs text-muted-foreground">{pdf.description}</p>}
                  <div className="flex flex-wrap gap-2 text-[0.7rem] text-muted-foreground">
                    <span>
                      Enviado em <span className="text-foreground">{formatDate(pdf.uploadedAt)}</span>
                    </span>
                    {pdf.coachName && (
                      <span className="before:mx-1 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-muted-foreground">
                        Coach <span className="text-foreground">{pdf.coachName}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-500/60 text-orange-400 hover:bg-orange-500 hover:text-black"
                  asChild
                >
                  <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                    Abrir PDF
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
