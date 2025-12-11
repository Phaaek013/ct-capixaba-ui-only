"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type AlunoOption = {
  id: number;
  nome: string | null;
};

type HistoricoItem = {
  id: number;
  titulo: string;
  enviadoEmISO: string;
  qtdDestinatarios: number;
  destinatariosResumo: string;
  url: string;
  destinatariosIds: number[];
};

type Props = {
  alunos: AlunoOption[];
  historico: HistoricoItem[];
};

type SheetMode = "create" | "edit";

export function CoachPdfsClient({ alunos, historico: initialHistorico }: Props) {
  const router = useRouter();

  // estado de dados
  const [historico, setHistorico] = useState<HistoricoItem[]>(initialHistorico);

  useEffect(() => {
    setHistorico(initialHistorico);
  }, [initialHistorico]);

  // estado de UI
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>("create");
  const [editingItem, setEditingItem] = useState<HistoricoItem | null>(null);

  const [titulo, setTitulo] = useState("");
  const [alunosSelecionados, setAlunosSelecionados] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [sendToAll, setSendToAll] = useState(false);
  const [erroAlunos, setErroAlunos] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalAlunos = alunos.length;

  function resetFormState() {
    setTitulo("");
    setAlunosSelecionados([]);
    setFile(null);
    setSendToAll(false);
    setErroAlunos(null);
    setEditingItem(null);
  }

  function openSheetForCreate() {
    resetFormState();
    setSheetMode("create");
    setIsSheetOpen(true);
  }

  function openSheetForEdit(item: HistoricoItem) {
    setSheetMode("edit");
    setEditingItem(item);
    setTitulo(item.titulo);

    const allIds = alunos.map((a) => a.id);
    const destinatariosSet = new Set(item.destinatariosIds);

    const isGlobal =
      item.destinatariosIds.length === allIds.length &&
      allIds.every((id) => destinatariosSet.has(id));

    setSendToAll(isGlobal);
    setAlunosSelecionados(isGlobal ? allIds : item.destinatariosIds);

    setFile(null);
    setErroAlunos(null);
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetOpen(false);
    resetFormState();
    setSheetMode("create");
  }

  function handleChangeAlunos(e: React.ChangeEvent<HTMLSelectElement>) {
    const values = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value)
    );
    setAlunosSelecionados(values);
    if (values.length > 0) setErroAlunos(null);
  }

  function handleToggleSendToAll() {
    const newValue = !sendToAll;
    setSendToAll(newValue);

    if (newValue) {
      const allIds = alunos.map((a) => a.id);
      setAlunosSelecionados(allIds);
      setErroAlunos(null);
    } else {
      if (sheetMode === "create") {
        setAlunosSelecionados([]);
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const tituloFinal = titulo.trim();
    if (!tituloFinal) return;

    const alunosIds = sendToAll
      ? alunos.map((a) => a.id)
      : alunosSelecionados;

    if (!alunosIds.length) {
      setErroAlunos("Selecione pelo menos um aluno.");
      return;
    }

    const isEdit = sheetMode === "edit" && !!editingItem;
    const arquivo = file;

    if (!isEdit && !arquivo) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && editingItem) {
        const res = await fetch(`/api/coach/pdfs/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: tituloFinal,
            alunosIds,
          }),
        });

        if (!res.ok) {
          console.error("Erro ao editar PDF", await res.text());
          return;
        }

        const updated: HistoricoItem = await res.json();
        setHistorico((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const data = new FormData();
        data.append("titulo", tituloFinal);
        alunosIds.forEach((id) => data.append("alunosIds", String(id)));
        data.append("arquivo", arquivo!);

        const res = await fetch("/api/coach/pdfs", {
          method: "POST",
          body: data,
        });

        if (!res.ok) {
          console.error("Erro ao enviar PDF", await res.text());
          return;
        }

        const created: HistoricoItem = await res.json();
        setHistorico((prev) => [created, ...prev]);
      }

      closeSheet();
      setSuccessMessage(
        isEdit ? "PDF atualizado com sucesso." : "PDF enviado com sucesso."
      );
      setTimeout(() => setSuccessMessage(null), 4000);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemover(id: number) {
    if (!confirm("Remover este PDF do histórico?")) return;

    try {
      setRemovendoId(id);

      const res = await fetch(`/api/coach/pdfs/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Erro ao remover PDF", await res.text());
        return;
      }

      setHistorico((prev) => prev.filter((item) => item.id !== id));
      router.refresh();
    } finally {
      setRemovendoId(null);
    }
  }

  function formatDataHora(iso: string) {
    const d = new Date(iso);
    const data = d.toLocaleDateString("pt-BR");
    const hora = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${data} às ${hora}`;
  }

  const filteredHistorico = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return historico;
    return historico.filter((item) =>
      item.titulo.toLowerCase().includes(term)
    );
  }, [historico, searchTerm]);

  return (
    <div className="relative mx-auto max-w-5xl pb-24 px-4 md:px-0">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-zinc-50">Envio de PDFs</h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-xl">
          Envie novos PDFs para os alunos e acompanhe o histórico de envios.
        </p>
      </header>

      {successMessage && (
        <p className="mt-4 text-sm text-emerald-400">{successMessage}</p>
      )}

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar PDF pelo título..."
          className="w-full rounded-2xl border border-zinc-700 bg-[#141414] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
        />
      </div>

      {/* Histórico */}
      <section className="mt-2">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4">
          Histórico de PDFs enviados
        </h2>

        {filteredHistorico.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nenhum PDF encontrado. Tente outro termo na busca ou use o botão
            laranja “+” para criar um novo envio.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredHistorico.map((item) => (
              <article
                key={item.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-[28px] bg-[#141414] px-6 py-4"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-zinc-50">
                    {item.titulo}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {formatDataHora(item.enviadoEmISO)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Enviado para {item.qtdDestinatarios} aluno(s):{" "}
                    {item.destinatariosResumo}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 self-stretch sm:flex-row sm:items-center sm:gap-4 md:self-auto">
                  {/* grupo Editar / Remover */}
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => openSheetForEdit(item)}
                      className="bg-transparent border-0 p-0 text-xs font-medium text-zinc-300 hover:text-zinc-50 transition"
                      style={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                      Editar
                    </button>

                    <span className="h-3 w-px bg-zinc-700" />

                    <button
                      type="button"
                      onClick={() => handleRemover(item.id)}
                      disabled={removendoId === item.id}
                      className="bg-transparent border-0 p-0 text-xs font-medium text-zinc-400 hover:text-red-400 disabled:opacity-60 disabled:hover:text-zinc-400 transition"
                      style={{ backgroundColor: "transparent", boxShadow: "none" }}
                    >
                      {removendoId === item.id ? "Removendo..." : "Remover"}
                    </button>
                  </div>

                  {/* botão Abrir – continua sendo o único laranja */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-orange-500 px-6 py-2 text-xs font-semibold text-black shadow-[0_0_18px_rgba(249,115,22,0.5)] hover:bg-orange-400 transition"
                  >
                    Abrir
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Botão flutuante + */}
      <button
        type="button"
        onClick={openSheetForCreate}
        className="fixed bottom-8 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-black shadow-[0_0_25px_rgba(249,115,22,0.7)] hover:bg-orange-400 transition md:bottom-10 md:right-10"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom sheet / modal Novo PDF / Editar PDF */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 md:items-center">
          <div className="w-full max-w-lg rounded-t-[32px] bg-[#18120F] p-6 shadow-xl md:rounded-[32px]">
            <div className="mx-auto mb-4 h-1 w-14 rounded-full bg-zinc-600" />

            <h2 className="text-xl font-semibold text-zinc-50 mb-4">
              {sheetMode === "create" ? "Novo PDF" : "Editar PDF"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              encType={
                sheetMode === "create" ? "multipart/form-data" : undefined
              }
            >
              {/* Título */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex.: Avaliação física – Novembro"
                  className="rounded-2xl border border-zinc-700 bg-[#141414] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                />
              </div>

              {/* Enviar para todos */}
              <div className="flex items-center gap-2">
                <input
                  id="sendToAll"
                  type="checkbox"
                  checked={sendToAll}
                  onChange={handleToggleSendToAll}
                  className="h-4 w-4 rounded border-zinc-600 bg-[#141414] text-orange-500"
                />
                <label
                  htmlFor="sendToAll"
                  className="text-xs text-zinc-300 select-none"
                >
                  Enviar para todos os alunos
                </label>
              </div>

              {/* Alunos */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400">Alunos</label>
                <select
                  multiple
                  name="alunosIds"
                  value={alunosSelecionados.map(String)}
                  onChange={handleChangeAlunos}
                  disabled={sendToAll}
                  className="h-24 rounded-2xl border border-zinc-700 bg-[#141414] px-3 py-2 text-sm text-zinc-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                >
                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome ?? `Aluno #${aluno.id}`}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500">
                  Use Ctrl/Cmd para selecionar vários alunos.
                </span>
                {erroAlunos && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
                    <span>⚠</span>
                    <span>{erroAlunos}</span>
                  </div>
                )}
              </div>

              {/* Arquivo PDF – só no CREATE */}
              {sheetMode === "create" ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-400">Arquivo PDF</label>
                  <input
                    type="file"
                    name="arquivo"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-black hover:file:bg-orange-400"
                  />
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500">
                  O arquivo atual será mantido. Esta tela permite apenas editar
                  o título e os destinatários.
                </p>
              )}

              {/* Ações */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeSheet}
                  className="flex-1 rounded-full border border-zinc-600 bg-transparent px-6 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !titulo.trim() ||
                    (sheetMode === "create" && !file)
                  }
                  className="flex-1 rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold text-black shadow-[0_0_18px_rgba(249,115,22,0.5)] hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting
                    ? sheetMode === "create"
                      ? "Enviando..."
                      : "Salvando..."
                    : sheetMode === "create"
                    ? "Enviar PDF"
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
