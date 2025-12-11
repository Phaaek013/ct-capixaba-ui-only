// src/app/(app-shell)/(coach)/coach/alunos/CoachAlunosClient.tsx
"use client";

import * as React from "react";
import { X, Plus, DollarSign } from "lucide-react";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

type AlunoResumo = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  senhaPrecisaTroca: boolean;
  diaVencimentoMensalidade: number | null;
  proximoVencimentoEm: string | null;
  ultimoPagamentoEm: string | null;
  criadoEm: string | null;
};

type Props = {
  alunosIniciais: AlunoResumo[];
};

type ModoSheet = "create" | "edit";

type StatusMensalidade = "em_dia" | "a_vencer" | "vencida" | "sem_config";

function calcularStatusMensalidade(
  proximoVencimentoEm: string | null
): StatusMensalidade {
  if (!proximoVencimentoEm) return "sem_config";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(proximoVencimentoEm);
  vencimento.setHours(0, 0, 0, 0);

  const msPorDia = 24 * 60 * 60 * 1000;
  const diffDias = Math.floor((vencimento.getTime() - hoje.getTime()) / msPorDia);

  if (diffDias < 0) return "vencida";
  if (diffDias <= 3) return "a_vencer";
  return "em_dia";
}

function formatarData(dataStr: string | null): string {
  if (!dataStr) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dataStr));
}

export function CoachAlunosClient({ alunosIniciais }: Props) {
  const [alunos, setAlunos] = React.useState<AlunoResumo[]>(alunosIniciais);
  const [busca, setBusca] = React.useState("");
  const [mensagem, setMensagem] = React.useState<string | null>(null);

  const [sheetAberto, setSheetAberto] = React.useState(false);
  const [modoSheet, setModoSheet] = React.useState<ModoSheet>("create");
  const [alunoEditando, setAlunoEditando] = React.useState<AlunoResumo | null>(
    null
  );

  // campos do formulário
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [diaVencimento, setDiaVencimento] = React.useState<string>("");

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const [loadingPagamento, setLoadingPagamento] = React.useState(false);
  const [erroForm, setErroForm] = React.useState<string | null>(null);

  const alunosFiltrados = React.useMemo(() => {
    if (!busca.trim()) return alunos;
    const termo = busca.toLowerCase();
    return alunos.filter(
      (a) =>
        a.nome.toLowerCase().includes(termo) ||
        a.email.toLowerCase().includes(termo)
    );
  }, [alunos, busca]);

  function abrirSheetNovo() {
    setModoSheet("create");
    setAlunoEditando(null);
    setNome("");
    setEmail("");
    setSenha("");
    setDiaVencimento("");
    setErroForm(null);
    setSheetAberto(true);
  }

  function abrirSheetEditar(aluno: AlunoResumo) {
    setModoSheet("edit");
    setAlunoEditando(aluno);
    setNome(aluno.nome);
    setEmail(aluno.email);
    setSenha("");
    setDiaVencimento(
      aluno.diaVencimentoMensalidade
        ? String(aluno.diaVencimentoMensalidade)
        : ""
    );
    setErroForm(null);
    setSheetAberto(true);
  }

  function fecharSheet() {
    setSheetAberto(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroForm(null);
    setLoadingSubmit(true);

    try {
      const dia =
        diaVencimento.trim() === "" ? null : Number(diaVencimento.trim());

      if (dia !== null && (Number.isNaN(dia) || dia < 1 || dia > 31)) {
        setErroForm("Dia de vencimento deve estar entre 1 e 31.");
        setLoadingSubmit(false);
        return;
      }

      if (!nome.trim()) {
        setErroForm("Nome é obrigatório.");
        setLoadingSubmit(false);
        return;
      }

      if (!email.trim() || !email.includes("@")) {
        setErroForm("E-mail inválido.");
        setLoadingSubmit(false);
        return;
      }

      if (modoSheet === "create" && (!senha || senha.length < MIN_PASSWORD_LENGTH)) {
        setErroForm(`Senha inicial deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
        setLoadingSubmit(false);
        return;
      }

      if (modoSheet === "create") {
        const res = await fetch("/api/coach/alunos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome.trim(),
            email: email.trim(),
            senha: senha.trim(),
            diaVencimentoMensalidade: dia,
          }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setErroForm(data?.error || "Erro ao criar aluno.");
          setLoadingSubmit(false);
          return;
        }

        setAlunos((prev) => [
          {
            id: data.id,
            nome: data.nome,
            email: data.email,
            ativo: data.ativo,
            senhaPrecisaTroca: data.senhaPrecisaTroca,
            diaVencimentoMensalidade: data.diaVencimentoMensalidade ?? null,
            proximoVencimentoEm: data.proximoVencimentoEm ?? null,
            ultimoPagamentoEm: data.ultimoPagamentoEm ?? null,
            criadoEm: null,
          },
          ...prev,
        ]);

        setMensagem("Aluno criado com sucesso.");
      } else if (modoSheet === "edit" && alunoEditando) {
        const payload: Record<string, unknown> = {
          nome: nome.trim(),
          email: email.trim(),
          diaVencimentoMensalidade: dia,
        };

        if (senha.trim()) {
          payload.novaSenha = senha.trim();
        }

        const res = await fetch(`/api/coach/alunos/${alunoEditando.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setErroForm(data?.error || "Erro ao atualizar aluno.");
          setLoadingSubmit(false);
          return;
        }

        setAlunos((prev) =>
          prev.map((a) =>
            a.id === alunoEditando.id
              ? {
                  ...a,
                  nome: data.nome,
                  email: data.email,
                  ativo: data.ativo,
                  senhaPrecisaTroca: data.senhaPrecisaTroca,
                  diaVencimentoMensalidade:
                    data.diaVencimentoMensalidade ?? null,
                  proximoVencimentoEm: data.proximoVencimentoEm ?? null,
                  ultimoPagamentoEm: data.ultimoPagamentoEm ?? null,
                }
              : a
          )
        );

        setMensagem("Aluno atualizado com sucesso.");
      }

      // fecha sheet e limpa senha
      setSenha("");
      setSheetAberto(false);

      // limpa mensagem depois de alguns segundos
      setTimeout(() => setMensagem(null), 4000);
    } catch (err) {
      console.error(err);
      setErroForm("Erro inesperado ao salvar aluno.");
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function handleConfirmarPagamento() {
    if (!alunoEditando) return;
    
    if (!alunoEditando.diaVencimentoMensalidade) {
      setErroForm("Configure o dia de vencimento antes de confirmar o pagamento.");
      return;
    }

    setLoadingPagamento(true);
    setErroForm(null);

    try {
      const res = await fetch(`/api/coach/alunos/${alunoEditando.id}/confirmar-pagamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErroForm(data?.error || "Erro ao confirmar pagamento.");
        return;
      }

      // Atualizar o aluno na lista
      setAlunos((prev) =>
        prev.map((a) =>
          a.id === alunoEditando.id
            ? {
                ...a,
                ativo: data.ativo,
                proximoVencimentoEm: data.proximoVencimentoEm,
                ultimoPagamentoEm: data.ultimoPagamentoEm,
              }
            : a
        )
      );

      // Atualizar o aluno em edição
      setAlunoEditando({
        ...alunoEditando,
        ativo: data.ativo,
        proximoVencimentoEm: data.proximoVencimentoEm,
        ultimoPagamentoEm: data.ultimoPagamentoEm,
      });

      setMensagem("Pagamento confirmado! Próximo vencimento atualizado.");
      setTimeout(() => setMensagem(null), 4000);
    } catch (err) {
      console.error(err);
      setErroForm("Erro inesperado ao confirmar pagamento.");
    } finally {
      setLoadingPagamento(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-24">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-50 mb-2">
              Gerenciar Alunos
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 mb-4">
              Gerencie o cadastro, senhas e vencimento dos seus alunos.
            </p>

            <div className="relative">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="w-full rounded-2xl bg-[#101010] border border-zinc-800 px-4 py-3 pl-11 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.5" y1="16.5" x2="21" y2="21" />
                </svg>
              </span>
            </div>
          </header>

          {mensagem && (
            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {mensagem}
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {alunosFiltrados.map((aluno) => {
              const iniciais = aluno.nome
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((parte) => parte[0])
                .join("")
                .toUpperCase();

              const statusTipo = !aluno.ativo
                ? "inativo"
                : aluno.senhaPrecisaTroca
                ? "pendente"
                : "ativo";

              const statusMensalidade = calcularStatusMensalidade(aluno.proximoVencimentoEm);

              const badgeMap: Record<
                "ativo" | "pendente" | "inativo",
                { label: string; badge: string; dot: string }
              > = {
                ativo: {
                  label: "Ativo",
                  badge:
                    "inline-flex items-center rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-300",
                  dot: "bg-emerald-300",
                },
                pendente: {
                  label: "Pendente de redefinição",
                  badge:
                    "inline-flex items-center rounded-full bg-amber-900/40 px-3 py-1 text-xs font-medium text-amber-300",
                  dot: "bg-amber-300",
                },
                inativo: {
                  label: "Inativo",
                  badge:
                    "inline-flex items-center rounded-full bg-red-900/40 px-3 py-1 text-xs font-medium text-red-300",
                  dot: "bg-red-300",
                },
              };

              const badgeInfo = badgeMap[statusTipo];

              const mensalidadeBadgeMap: Record<
                StatusMensalidade,
                { label: string; badge: string; dot: string } | null
              > = {
                em_dia: {
                  label: "Mensalidade em dia",
                  badge:
                    "inline-flex items-center rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-300",
                  dot: "bg-emerald-300",
                },
                a_vencer: {
                  label: "A vencer",
                  badge:
                    "inline-flex items-center rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium text-amber-300",
                  dot: "bg-amber-300",
                },
                vencida: {
                  label: "Vencida",
                  badge:
                    "inline-flex items-center rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] font-medium text-red-300",
                  dot: "bg-red-300",
                },
                sem_config: null,
              };

              const mensalidadeBadgeInfo = mensalidadeBadgeMap[statusMensalidade];

              return (
                <button
                  key={aluno.id}
                  type="button"
                  onClick={() => abrirSheetEditar(aluno)}
                  className="group w-full rounded-2xl bg-[#111111] px-4 py-3 sm:px-5 sm:py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#151515]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-50">
                        {iniciais}
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-medium text-zinc-50">
                          {aluno.nome}
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-400">
                          {aluno.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="flex flex-wrap gap-2">
                        <span className={badgeInfo.badge}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${badgeInfo.dot}`} />
                          {badgeInfo.label}
                        </span>
                        {mensalidadeBadgeInfo && (
                          <span className={mensalidadeBadgeInfo.badge}>
                            <span className={`mr-1 h-1 w-1 rounded-full ${mensalidadeBadgeInfo.dot}`} />
                            {mensalidadeBadgeInfo.label}
                          </span>
                        )}
                      </div>

                      {aluno.proximoVencimentoEm ? (
                        <span className="text-[11px] sm:text-xs text-zinc-500">
                          Próx. vencimento: {formatarData(aluno.proximoVencimentoEm)}
                        </span>
                      ) : aluno.diaVencimentoMensalidade ? (
                        <span className="text-[11px] sm:text-xs text-zinc-500">
                          Vence todo dia {aluno.diaVencimentoMensalidade}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}

            {alunosFiltrados.length === 0 && (
              <p className="mt-4 text-sm text-zinc-500">
                {busca.trim()
                  ? `Nenhum aluno encontrado para "${busca}".`
                  : "Nenhum aluno cadastrado. Use o botão + para adicionar."}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={abrirSheetNovo}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-black shadow-[0_0_30px_rgba(249,115,22,0.6)] transition hover:scale-105 active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>

      {/* Bottom sheet (criar/editar) */}
      {sheetAberto && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#241915] shadow-2xl flex flex-col max-h-screen">
            {/* Header fixo */}
            <header className="shrink-0 px-6 pt-4 pb-2 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-50">
                  {modoSheet === "create" ? "Cadastrar Aluno" : "Editar Aluno"}
                </h2>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition"
                  onClick={fecharSheet}
                  style={{ backgroundColor: "transparent", boxShadow: "none" }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome completo"
                  className="rounded-2xl border border-zinc-700 bg-[#141414] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  placeholder="email@exemplo.com"
                  className="rounded-2xl border border-zinc-700 bg-[#141414] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400">
                  {modoSheet === "create" ? "Senha inicial" : "Nova senha"}
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder={
                    modoSheet === "create"
                      ? "Defina uma senha temporária (min. 6 caracteres)"
                      : "Preencha apenas se for trocar a senha"
                  }
                  className="rounded-2xl border border-zinc-700 bg-[#141414] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                />
                {modoSheet === "edit" && (
                  <p className="text-[11px] text-zinc-500">
                    Deixe em branco para manter a senha atual. Se preencher,
                    gerará uma nova senha temporária.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-400">
                  Dia de vencimento da mensalidade
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  placeholder="Ex.: 10 (todo dia 10)"
                  className="max-w-[160px] rounded-2xl border border-zinc-700 bg-[#141414] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                />
                <p className="text-[11px] text-zinc-500">
                  Usaremos esse dia como base para avisos de vencimento e
                  bloqueio de acesso no futuro.
                </p>
              </div>

              {/* Seção de mensalidade - apenas no modo edição */}
              {modoSheet === "edit" && alunoEditando && (
                <div className="mt-2 rounded-2xl border border-zinc-700 bg-[#0d0d0d] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-300">Mensalidade</span>
                    {alunoEditando.proximoVencimentoEm && (
                      <span className={`text-xs font-medium ${
                        calcularStatusMensalidade(alunoEditando.proximoVencimentoEm) === "vencida"
                          ? "text-red-400"
                          : calcularStatusMensalidade(alunoEditando.proximoVencimentoEm) === "a_vencer"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}>
                        {calcularStatusMensalidade(alunoEditando.proximoVencimentoEm) === "vencida"
                          ? "⚠️ Vencida"
                          : calcularStatusMensalidade(alunoEditando.proximoVencimentoEm) === "a_vencer"
                          ? "⏰ A vencer"
                          : "✅ Em dia"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-zinc-400 mb-4">
                    <div className="flex justify-between">
                      <span>Próximo vencimento:</span>
                      <span className="text-zinc-200">
                        {alunoEditando.proximoVencimentoEm 
                          ? formatarData(alunoEditando.proximoVencimentoEm)
                          : "Não configurado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Último pagamento:</span>
                      <span className="text-zinc-200">
                        {alunoEditando.ultimoPagamentoEm 
                          ? formatarData(alunoEditando.ultimoPagamentoEm)
                          : "Nenhum registrado"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmarPagamento}
                    disabled={loadingPagamento || !alunoEditando.diaVencimentoMensalidade}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <DollarSign className="h-4 w-4" />
                    {loadingPagamento ? "Confirmando..." : "Confirmar Pagamento"}
                  </button>
                  {!alunoEditando.diaVencimentoMensalidade && (
                    <p className="mt-2 text-[10px] text-amber-400 text-center">
                      Configure o dia de vencimento acima para confirmar pagamentos.
                    </p>
                  )}
                </div>
              )}

              {erroForm && (
                <div className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 border border-red-500/20">
                  {erroForm}
                </div>
              )}
            </div>

            {/* Footer fixo */}
            <footer className="shrink-0 border-t border-white/10 px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={fecharSheet}
                disabled={loadingSubmit}
                className="flex-1 rounded-full border border-zinc-600 bg-transparent px-6 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition disabled:opacity-60"
                style={{ backgroundColor: "transparent", boxShadow: "none" }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loadingSubmit}
                className="flex-1 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_18px_rgba(249,115,22,0.5)] hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loadingSubmit
                  ? "Salvando..."
                  : modoSheet === "create"
                  ? "Salvar"
                  : "Salvar alterações"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
