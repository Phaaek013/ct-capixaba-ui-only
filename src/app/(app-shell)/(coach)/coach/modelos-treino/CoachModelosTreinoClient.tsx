"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { TreinoModelo } from "@/types/treino";
import { useRouter } from "next/navigation";

interface CoachModelosTreinoClientProps {
  modelosIniciais: TreinoModelo[];
}

type ModoSheet = "create" | "edit" | null;

export default function CoachModelosTreinoClient({
  modelosIniciais,
}: CoachModelosTreinoClientProps) {
  const router = useRouter();

  const [modelos, setModelos] = useState<TreinoModelo[]>(modelosIniciais);
  const [busca, setBusca] = useState("");
  const [sheetAberto, setSheetAberto] = useState(false);
  const [modoSheet, setModoSheet] = useState<ModoSheet>(null);
  const [modeloEdicao, setModeloEdicao] = useState<TreinoModelo | null>(null);

  // Form state
  const [titulo, setTitulo] = useState("");
  const [foco, setFoco] = useState("");
  const [mobilidade, setMobilidade] = useState("");
  const [aquecimento, setAquecimento] = useState("");
  const [skillForca, setSkillForca] = useState("");
  const [wod, setWod] = useState("");
  const [alongamento, setAlongamento] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const modelosFiltrados = useMemo(
    () =>
      modelos.filter((m) =>
        m.titulo.toLowerCase().includes(busca.toLowerCase())
      ),
    [modelos, busca]
  );

  function abrirSheetCreate() {
    setModoSheet("create");
    setModeloEdicao(null);
    resetForm();
    setSheetAberto(true);
  }

  function abrirSheetEdit(m: TreinoModelo) {
    setModoSheet("edit");
    setModeloEdicao(m);
    setTitulo(m.titulo);
    setFoco(m.foco ?? "");
    setMobilidade(m.mobilidade ?? "");
    setAquecimento(m.aquecimento ?? "");
    setSkillForca(m.skillForca ?? "");
    setWod(m.wod ?? "");
    setAlongamento(m.alongamento ?? "");
    setVideoUrl(m.videoUrl ?? "");
    setSheetAberto(true);
  }

  function resetForm() {
    setTitulo("");
    setFoco("");
    setMobilidade("");
    setAquecimento("");
    setSkillForca("");
    setWod("");
    setAlongamento("");
    setVideoUrl("");
    setErroForm(null);
    setMensagem(null);
  }

  async function handleSubmit() {
    try {
      setErroForm(null);
      setMensagem(null);
      setLoadingSubmit(true);

      if (!titulo.trim()) {
        setErroForm("O título do modelo é obrigatório.");
        return;
      }

      const payload = {
        titulo: titulo.trim(),
        foco: foco || null,
        mobilidade: mobilidade || null,
        aquecimento: aquecimento || null,
        skillForca: skillForca || null,
        wod: wod || null,
        alongamento: alongamento || null,
        videoUrl: videoUrl || null,
      };

      let res;
      if (modoSheet === "create") {
        res = await fetch("/api/coach/modelos-treino", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (modoSheet === "edit" && modeloEdicao) {
        res = await fetch(`/api/coach/modelos-treino/${modeloEdicao.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(errorText);
        setErroForm("Erro ao salvar modelo.");
        return;
      }

      const json = await res.json().catch(() => ({ modelo: null }));

      if (json?.modelo) {
        if (modoSheet === "create") {
          setModelos((prev) => [json.modelo as TreinoModelo, ...prev]);
        } else {
          setModelos((prev) =>
            prev.map((m) => (m.id === json.modelo.id ? json.modelo : m))
          );
        }
      } else {
        router.refresh();
      }

      setMensagem(
        modoSheet === "create"
          ? "Modelo criado com sucesso."
          : "Modelo atualizado com sucesso."
      );
      setSheetAberto(false);
    } catch (e) {
      console.error(e);
      setErroForm("Erro inesperado ao salvar modelo.");
    } finally {
      setLoadingSubmit(false);
      setTimeout(() => setMensagem(null), 4000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente remover este modelo?")) return;
    try {
      const res = await fetch(`/api/coach/modelos-treino/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error(await res.text());
        return;
      }
      setModelos((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-50 mb-2">
          Biblioteca de Treinos
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Crie e gerencie modelos de treino reutilizáveis.
        </p>
      </header>

      {/* Barra de busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar modelo por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      </div>

      {/* Mensagem de sucesso global */}
      {mensagem && (
        <div className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-4 py-3">
          {mensagem}
        </div>
      )}

      {/* Lista de modelos */}
      <section className="space-y-3">
        {modelosFiltrados.length === 0 ? (
          <div className="text-sm text-zinc-500 py-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800">
            {modelos.length === 0
              ? "Nenhum modelo de treino cadastrado ainda."
              : "Nenhum modelo encontrado com essa busca."}
          </div>
        ) : (
          modelosFiltrados.map((m) => (
            <article
              key={m.id}
              className="bg-zinc-900/70 border border-zinc-800/60 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-medium text-zinc-50 truncate">
                  {m.titulo}
                </h2>
                {m.foco && (
                  <p className="text-xs text-zinc-400 mt-1 truncate">
                    Foco: {m.foco}
                  </p>
                )}
                {m.wod && (
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                    WOD: {m.wod.slice(0, 100)}
                    {m.wod.length > 100 ? "..." : ""}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => abrirSheetEdit(m)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-red-500/60 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Remover
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* FAB */}
      <button
        type="button"
        onClick={abrirSheetCreate}
        className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 w-14 h-14 rounded-full bg-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.5)]
                   flex items-center justify-center text-black text-2xl hover:bg-orange-400 transition-colors z-30"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Bottom sheet */}
      {sheetAberto && (
        <div
          className="fixed inset-0 bg-black/70 z-40 flex items-end sm:items-center sm:justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSheetAberto(false);
          }}
        >
          <div className="w-full sm:max-w-2xl bg-[#161616] rounded-t-3xl sm:rounded-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 rounded-full bg-zinc-600 mx-auto mb-4 sm:hidden" />
            <h2 className="text-lg font-semibold text-zinc-50 mb-4">
              {modoSheet === "create" ? "Criar modelo" : "Editar modelo"}
            </h2>

            {/* Título */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">
                Título do modelo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Treino HIIT - Iniciante"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Foco */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">Foco do treino</label>
              <textarea
                value={foco}
                onChange={(e) => setFoco(e.target.value)}
                placeholder="Descreva o foco principal do treino"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                rows={2}
              />
            </div>

            {/* Mobilidade */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">Mobilidade</label>
              <textarea
                value={mobilidade}
                onChange={(e) => setMobilidade(e.target.value)}
                placeholder="Exercícios de mobilidade (opcional)"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                rows={2}
              />
            </div>

            {/* Aquecimento */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">Aquecimento</label>
              <textarea
                value={aquecimento}
                onChange={(e) => setAquecimento(e.target.value)}
                placeholder="Aquecimento / Ativação (opcional)"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                rows={2}
              />
            </div>

            {/* Skill / Força */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">Skill / Força</label>
              <textarea
                value={skillForca}
                onChange={(e) => setSkillForca(e.target.value)}
                placeholder="Bloco de skill ou força (opcional)"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                rows={2}
              />
            </div>

            {/* WOD */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">WOD</label>
              <textarea
                value={wod}
                onChange={(e) => setWod(e.target.value)}
                placeholder="Workout of the Day"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                rows={3}
              />
            </div>

            {/* Alongamento */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">Alongamento / Cool Down</label>
              <textarea
                value={alongamento}
                onChange={(e) => setAlongamento(e.target.value)}
                placeholder="Alongamento final (opcional)"
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                rows={2}
              />
            </div>

            {/* Vídeo */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">URL do vídeo (YouTube)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Erros */}
            {erroForm && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2 mb-3">
                {erroForm}
              </p>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSheetAberto(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loadingSubmit}
                className="w-full sm:w-auto px-6 py-2 rounded-full bg-orange-500 text-sm font-medium text-black hover:bg-orange-400 disabled:opacity-70 transition-colors"
              >
                {loadingSubmit
                  ? "Salvando..."
                  : modoSheet === "create"
                  ? "Criar modelo"
                  : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
