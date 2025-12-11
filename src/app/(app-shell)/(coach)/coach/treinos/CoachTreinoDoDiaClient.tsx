"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { TreinoBase, TreinoModelo } from "@/types/treino";

// DTO vindo da API
type TreinoDoDiaDto = {
  id: number;
  alunoId: number | null;
  coachId: number | null;
  dataTreino: string | null;
  conteudo: {
    titulo?: string;
    foco?: string;
    mobilidade?: string;
    aquecimento?: string;
    skillForca?: string;
    wod?: string;
    alongamento?: string;
  };
  videoUrl: string | null;
  ehModelo: boolean;
  nomeModelo: string | null;
  createdAt: string;
  updatedAt: string;
  aluno?: { id: number; nome: string } | null;
  isConcluido?: boolean;
};

interface CoachTreinoDoDiaClientProps {
  dataInicialISO: string;
  treinosIniciais: TreinoBase[];
  alunos: { id: string; nome: string; email: string }[];
  modelos: TreinoModelo[];
}

type ModoSheet = "create" | "edit" | null;

export default function CoachTreinoDoDiaClient({
  dataInicialISO,
  treinosIniciais,
  alunos,
  modelos,
}: CoachTreinoDoDiaClientProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date(dataInicialISO + "T12:00:00"));
  const [treinos, setTreinos] = useState<TreinoBase[]>(treinosIniciais);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [modoSheet, setModoSheet] = useState<ModoSheet>(null);
  const [treinoEdicao, setTreinoEdicao] = useState<TreinoBase | null>(null);
  const [loadingTreinos, setLoadingTreinos] = useState(false);

  // Cálculo da semana (mesmo padrão do aluno)
  const semanaInicio = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 1 }),
    [selectedDate]
  );

  const diasSemana = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(semanaInicio, i)),
    [semanaInicio]
  );

  const labelSemana = useMemo(() => {
    const inicio = format(diasSemana[0], "d", { locale: ptBR });
    const fim = format(diasSemana[6], "d MMM", { locale: ptBR });
    return `${inicio}–${fim}`;
  }, [diasSemana]);

  function irParaSemanaAnterior() {
    setSelectedDate((prev) => addWeeks(prev, -1));
  }

  function irParaProximaSemana() {
    setSelectedDate((prev) => addWeeks(prev, 1));
  }

  function selecionarDia(d: Date) {
    setSelectedDate(d);
  }

  // Form state
  const [titulo, setTitulo] = useState("");
  const [foco, setFoco] = useState("");
  const [mobilidade, setMobilidade] = useState("");
  const [aquecimento, setAquecimento] = useState("");
  const [skillForca, setSkillForca] = useState("");
  const [wod, setWod] = useState("");
  const [alongamento, setAlongamento] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [alunoIds, setAlunoIds] = useState<string[]>([]);
  const [modeloBusca, setModeloBusca] = useState("");
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState<string | null>(null);
  const [salvarComoModelo, setSalvarComoModelo] = useState(false);
  const [tituloModelo, setTituloModelo] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // Data selecionada em formato ISO (yyyy-MM-dd)
  const dataSelecionadaISO = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  // Converte DTO da API para TreinoBase (função reutilizável)
  function convertDtoToBase(t: TreinoDoDiaDto, dataFallback: string): TreinoBase {
    return {
      id: String(t.id),
      titulo: t.nomeModelo || t.conteudo.titulo || t.conteudo.foco || "Treino",
      data: t.dataTreino ?? dataFallback,
      alunosResumo: t.aluno ? t.aluno.nome : "Sem aluno vinculado",
      alunoIds: t.alunoId ? [String(t.alunoId)] : [],
      foco: t.conteudo.foco ?? null,
      mobilidade: t.conteudo.mobilidade ?? null,
      aquecimento: t.conteudo.aquecimento ?? null,
      skillForca: t.conteudo.skillForca ?? null,
      wod: t.conteudo.wod ?? null,
      alongamento: t.conteudo.alongamento ?? null,
      videoUrl: t.videoUrl ?? null,
      modeloId: null,
      isConcluido: t.isConcluido ?? false,
    };
  }

  // Função de load centralizada - recebe dateStr explicitamente
  // IMPORTANTE: sempre passa a data como parâmetro, nunca usa closure de selectedDate
  async function loadTreinos(dateStr: string) {
    setLoadingTreinos(true);

    try {
      const res = await fetch(
        `/api/coach/treinos?data=${encodeURIComponent(dateStr)}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        console.error("Erro ao carregar treinos:", res.status);
        setTreinos([]);
        return;
      }

      const json = await res.json() as TreinoDoDiaDto[];
      const treinosConvertidos = json.map((t) => convertDtoToBase(t, dateStr));
      setTreinos(treinosConvertidos);
    } catch (e) {
      console.error("Erro ao carregar treinos:", e);
      setTreinos([]);
    } finally {
      setLoadingTreinos(false);
    }
  }

  // Efeito para carregar treinos quando muda de dia
  // SEMPRE busca da API, sem condição de "data inicial"
  useEffect(() => {
    loadTreinos(dataSelecionadaISO);
  }, [dataSelecionadaISO]);

  function abrirSheetCreate() {
    setModoSheet("create");
    setTreinoEdicao(null);
    resetForm();
    setSheetAberto(true);
  }

  function abrirSheetEdit(t: TreinoBase) {
    setModoSheet("edit");
    setTreinoEdicao(t);
    setTitulo(t.titulo ?? "");
    setFoco(t.foco ?? "");
    setMobilidade(t.mobilidade ?? "");
    setAquecimento(t.aquecimento ?? "");
    setSkillForca(t.skillForca ?? "");
    setWod(t.wod ?? "");
    setAlongamento(t.alongamento ?? "");
    setVideoUrl(t.videoUrl ?? "");
    setAlunoIds(t.alunoIds ?? []);
    setSalvarComoModelo(Boolean(t.modeloId));
    setTituloModelo(t.titulo ?? "");
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
    setAlunoIds([]);
    setModeloBusca("");
    setModeloSelecionadoId(null);
    setSalvarComoModelo(false);
    setTituloModelo("");
    setErroForm(null);
    setMensagem(null);
  }

  async function handleSubmit() {
    try {
      setErroForm(null);
      setMensagem(null);
      setLoadingSubmit(true);

      if (!alunoIds.length) {
        setErroForm("Selecione pelo menos um aluno.");
        return;
      }

      // Monta blocos conforme API espera
      const blocos = {
        titulo: titulo || undefined,
        foco: foco || undefined,
        mobilidade: mobilidade || undefined,
        aquecimento: aquecimento || undefined,
        skillForca: skillForca || undefined,
        wod: wod || undefined,
        alongamento: alongamento || undefined,
      };

      let res;
      if (modoSheet === "create") {
        // POST: criar treinos para cada aluno
        const payload = {
          dataTreino: dataSelecionadaISO,
          alunoIds: alunoIds.map((id) => parseInt(id, 10)),
          blocos,
          videoUrl: videoUrl || undefined,
          salvarComoModelo,
          nomeModelo: salvarComoModelo ? (tituloModelo.trim() || titulo || undefined) : undefined,
        };
        res = await fetch("/api/coach/treinos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (modoSheet === "edit" && treinoEdicao) {
        // PATCH: editar treino existente (INCLUI dataTreino para permitir mover de dia)
        const payload = {
          id: parseInt(treinoEdicao.id, 10),
          dataTreino: dataSelecionadaISO,
          blocos,
          videoUrl: videoUrl || null,
          salvarComoModelo,
          nomeModelo: salvarComoModelo ? (tituloModelo.trim() || titulo || undefined) : undefined,
        };
        res = await fetch("/api/coach/treinos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setErroForm(errData.error || "Erro ao salvar treino.");
        return;
      }

      // PADRÃO OURO: sempre refetch depois de POST/PATCH
      // Isso garante que a lista vem limpa do servidor, evitando race conditions
      await loadTreinos(dataSelecionadaISO);

      setMensagem(
        modoSheet === "create"
          ? "Treino criado com sucesso."
          : "Treino atualizado com sucesso."
      );
      setSheetAberto(false);
    } catch (e) {
      console.error(e);
      setErroForm("Erro inesperado ao salvar treino.");
    } finally {
      setLoadingSubmit(false);
      setTimeout(() => setMensagem(null), 4000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente remover este treino?")) return;
    try {
      setLoadingTreinos(true);
      const res = await fetch("/api/coach/treinos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id, 10) }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Erro ao remover treino.");
        return;
      }
      // PADRÃO OURO: refetch depois de DELETE
      await loadTreinos(dataSelecionadaISO);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTreinos(false);
    }
  }

  const modelosFiltrados = useMemo(
    () =>
      modelos.filter((m) =>
        m.titulo.toLowerCase().includes(modeloBusca.toLowerCase())
      ),
    [modelos, modeloBusca]
  );

  function aplicarModelo(m: TreinoModelo) {
    setModeloSelecionadoId(m.id);
    setTitulo(m.titulo);
    setFoco(m.foco ?? "");
    setMobilidade(m.mobilidade ?? "");
    setAquecimento(m.aquecimento ?? "");
    setSkillForca(m.skillForca ?? "");
    setWod(m.wod ?? "");
    setAlongamento(m.alongamento ?? "");
    setVideoUrl(m.videoUrl ?? "");
  }

  // Toggle seleção de alunos
  function toggleAluno(id: string) {
    setAlunoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selecionarTodosAlunos() {
    setAlunoIds(alunos.map((a) => a.id));
  }

  function limparSelecaoAlunos() {
    setAlunoIds([]);
  }

  return (
    <div className="space-y-6">
      {/* HEADER - igual vibe do calendário do aluno */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-zinc-50 sm:text-2xl">Treino do dia</h1>
          <p className="text-xs text-zinc-400 sm:text-sm">Crie e gerencie os treinos aplicados para seus alunos.</p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/60 bg-black/40 text-orange-400 hover:bg-orange-500 hover:text-black transition-colors"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "date";
            input.value = dataSelecionadaISO;
            input.onchange = (e) => {
              const val = (e.target as HTMLInputElement).value;
              if (val) setSelectedDate(new Date(val + "T12:00:00"));
            };
            input.showPicker?.();
            input.click();
          }}
        >
          <CalendarDays className="h-5 w-5" />
        </button>
      </div>

      {/* NAVEGAÇÃO DE SEMANA */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-black/40 px-3 py-2 sm:px-4 sm:py-3">
        <button
          type="button"
          onClick={irParaSemanaAnterior}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/5 text-zinc-300 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[0.6rem] uppercase tracking-wide text-zinc-500 sm:text-xs">Semana</span>
          <span className="text-xs font-medium text-zinc-100 sm:text-sm">{labelSemana}</span>
        </div>

        <button
          type="button"
          onClick={irParaProximaSemana}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/5 text-zinc-300 transition-colors"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* DIAS DA SEMANA */}
      <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:justify-between sm:px-0">
        {diasSemana.map((dia) => {
          const isSelected = isSameDay(dia, selectedDate);
          const isToday = isSameDay(dia, new Date());
          const weekdayLabel = format(dia, "EEE", { locale: ptBR });
          const dayNumber = format(dia, "d", { locale: ptBR });

          return (
            <div
              key={dia.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => selecionarDia(dia)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  selecionarDia(dia);
                }
              }}
              className="flex min-w-[3rem] flex-col items-center gap-1 text-[0.7rem] cursor-pointer sm:min-w-0 sm:text-xs"
            >
              <span className="uppercase text-[0.6rem] text-zinc-500">{weekdayLabel}</span>

              <span
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition sm:h-10 sm:w-10",
                  isSelected
                    ? "border-orange-500 bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                    : "border-orange-500/40 bg-transparent text-zinc-100 hover:bg-orange-500/10"
                ].join(" ")}
              >
                {dayNumber}
              </span>

              {isToday && <span className="mt-1 text-[0.6rem] text-orange-400">hoje</span>}
            </div>
          );
        })}
      </div>

      {/* Mensagem de sucesso global */}
      {mensagem && (
        <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-4 py-3">
          {mensagem}
        </div>
      )}

      {/* Título do dia selecionado */}
      <h2 className="text-base font-semibold text-zinc-100 sm:text-lg">
        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
      </h2>

      {/* Lista de treinos do dia */}
      <section className="space-y-3">
        {loadingTreinos ? (
          <div className="rounded-2xl border border-zinc-800/70 bg-black/40 px-4 py-6 text-center text-sm text-zinc-400">
            Carregando treinos...
          </div>
        ) : treinos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700/70 bg-black/40 px-4 py-6 text-center text-sm text-zinc-400">
            Nenhum treino cadastrado para este dia.
          </div>
        ) : (
          treinos.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-zinc-800/80 bg-black/40 px-4 py-3 hover:border-zinc-600/80 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => abrirSheetEdit(t)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-sm font-medium text-zinc-50 truncate">
                    {t.titulo || "Treino sem título"}
                  </p>
                  <p className="mt-0.5 text-xs text-orange-400/90 truncate">
                    {t.alunosResumo || "Sem aluno"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
                    {t.foco || "Sem foco específico informado."}
                  </p>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {t.isConcluido && (
                    <span className="text-[11px] rounded-full bg-green-600/20 border border-green-500/30 px-3 py-1 text-green-400">
                      Concluído
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                    className="p-1.5 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remover treino"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* FAB para novo treino */}
      <button
        type="button"
        onClick={abrirSheetCreate}
        className="fixed bottom-24 right-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-black shadow-lg shadow-orange-500/30 hover:bg-orange-400 transition-colors z-30"
      >
        <Plus className="h-6 w-6" />
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
              {modoSheet === "create" ? "Criar treino" : "Editar treino"}
            </h2>

            {/* Data do treino */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">Data do treino</label>
              <input
                type="date"
                value={dataSelecionadaISO}
                onChange={(e) => setSelectedDate(new Date(e.target.value + "T12:00:00"))}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Seleção de alunos */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-400">Alunos</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selecionarTodosAlunos}
                    className="text-[10px] text-orange-400 hover:text-orange-300"
                  >
                    Selecionar todos
                  </button>
                  <span className="text-zinc-600">|</span>
                  <button
                    type="button"
                    onClick={limparSelecaoAlunos}
                    className="text-[10px] text-zinc-400 hover:text-zinc-300"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto border border-zinc-800 rounded-xl p-2 space-y-1">
                {alunos.length === 0 ? (
                  <p className="text-xs text-zinc-500 px-2 py-1">
                    Nenhum aluno cadastrado.
                  </p>
                ) : (
                  alunos.map((a) => (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        alunoIds.includes(a.id)
                          ? "bg-orange-500/20 text-orange-200"
                          : "hover:bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={alunoIds.includes(a.id)}
                        onChange={() => toggleAluno(a.id)}
                        className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-orange-500 focus:ring-orange-500/50"
                      />
                      <span className="text-xs truncate flex-1">{a.nome}</span>
                      <span className="text-[10px] text-zinc-500 truncate">
                        {a.email}
                      </span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                {alunoIds.length} aluno(s) selecionado(s)
              </p>
            </div>

            {/* Título */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-zinc-400">Título do treino</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Treino A - Membros Superiores"
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

            {/* Seletor de modelo */}
            <div className="space-y-2 mb-4 border-t border-zinc-800 pt-4">
              <label className="text-xs text-zinc-400">
                Puxar treino da biblioteca
              </label>
              <input
                type="text"
                placeholder="Buscar pelo título..."
                value={modeloBusca}
                onChange={(e) => setModeloBusca(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <div className="max-h-40 overflow-y-auto border border-zinc-800 rounded-xl">
                {modelosFiltrados.length === 0 ? (
                  <p className="text-xs text-zinc-500 px-3 py-2">
                    {modelos.length === 0
                      ? "Nenhum modelo salvo ainda."
                      : "Nenhum modelo encontrado."}
                  </p>
                ) : (
                  modelosFiltrados.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => aplicarModelo(m)}
                      className={`w-full text-left px-3 py-2 text-xs border-b border-zinc-800 last:border-b-0 transition-colors ${
                        modeloSelecionadoId === m.id
                          ? "bg-orange-500/20 text-orange-200"
                          : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {m.titulo}
                    </button>
                  ))
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                Ao escolher um modelo, os campos serão preenchidos automaticamente.
              </p>
            </div>

            {/* Checkbox salvar como modelo */}
            <div className="flex items-center gap-2 mb-4">
              <input
                id="salvarComoModelo"
                type="checkbox"
                checked={salvarComoModelo}
                onChange={(e) => setSalvarComoModelo(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 text-orange-500 focus:ring-orange-500/50"
              />
              <label htmlFor="salvarComoModelo" className="text-xs text-zinc-300">
                Salvar este treino na biblioteca de modelos
              </label>
            </div>

            {salvarComoModelo && (
              <div className="space-y-2 mb-4">
                <label className="text-xs text-zinc-400">
                  Título do modelo (como ficará salvo na biblioteca)
                </label>
                <input
                  type="text"
                  value={tituloModelo}
                  onChange={(e) => setTituloModelo(e.target.value)}
                  placeholder="Ex: Costas e Bíceps – Avançado"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            )}

            {/* Erros e mensagens */}
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
                  ? "Salvar treino"
                  : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
