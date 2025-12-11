import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getResumoAlunosMensalidade } from "@/lib/coach-dashboard";
import { CoachProfileSection } from "./CoachProfileSection";
import { salvarConfig } from "./actions";

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

type DashboardCardProps = {
  titulo: string;
  valor: number;
  subtitulo?: string;
  variant?: "ok" | "warning" | "danger" | "muted";
};

function DashboardCard({ titulo, valor, subtitulo, variant = "muted" }: DashboardCardProps) {
  const border =
    variant === "ok"
      ? "border-emerald-500/40"
      : variant === "warning"
      ? "border-amber-500/40"
      : variant === "danger"
      ? "border-red-500/40"
      : "border-zinc-700";

  const textColor =
    variant === "ok"
      ? "text-emerald-400"
      : variant === "warning"
      ? "text-amber-400"
      : variant === "danger"
      ? "text-red-400"
      : "text-zinc-50";

  return (
    <div className={`rounded-2xl bg-[#111111] border ${border} px-4 py-3`}>
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {titulo}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${textColor}`}>
        {valor}
      </div>
      {subtitulo && (
        <div className="mt-1 text-xs text-zinc-500">
          {subtitulo}
        </div>
      )}
    </div>
  );
}

export default async function ConfigPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  if (session.user.tipo !== "Coach") {
    redirect(session.user.tipo === "Aluno" ? "/aluno" : "/login");
  }

  const userEmail = session.user.email!;

  const coachPromise = prisma.usuario.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      nome: true,
      email: true,
      avatarUrl: true,
    },
  });

  const [config, totalTreinos, totalDocumentos, resumoAlunos, coach] = await Promise.all([
    getConfig(),
    prisma.treino.count({ where: { ehModelo: false } }),
    prisma.documentoPDF.count(),
    getResumoAlunosMensalidade(),
    coachPromise,
  ]);

  if (!coach) {
    redirect("/login");
  }

  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;
  const mensagemSucesso = typeof searchParams?.sucesso === "string" ? searchParams?.sucesso : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-24 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-50">Configurações</h1>
        <p className="text-sm text-zinc-400">Gerencie o CT Capixaba e visualize estatísticas.</p>
        {mensagemErro === "invalid" && (
          <p className="text-sm text-red-400">Informe um número inteiro maior que zero.</p>
        )}
        {mensagemSucesso && <p className="text-sm text-emerald-400">Configuração atualizada.</p>}
      </div>

      <CoachProfileSection
        coach={{
          nome: coach.nome ?? "",
          email: coach.email,
          avatarUrl: coach.avatarUrl ?? null,
        }}
      />

      {/* Visão geral dos alunos - MENSALIDADE */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-50">
          Visão geral dos alunos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            titulo="Total de alunos"
            valor={resumoAlunos.total}
            subtitulo="Todos os alunos cadastrados"
          />

          <DashboardCard
            titulo="Em dia"
            valor={resumoAlunos.emDia}
            subtitulo="Mensalidade em dia"
            variant="ok"
          />

          <DashboardCard
            titulo="A vencer"
            valor={resumoAlunos.aVencer}
            subtitulo="Vencimento em até 3 dias"
            variant="warning"
          />

          <DashboardCard
            titulo="Vencida"
            valor={resumoAlunos.vencida}
            subtitulo="Mensalidade vencida"
            variant="danger"
          />

          <DashboardCard
            titulo="Sem vencimento"
            valor={resumoAlunos.semConfig}
            subtitulo="Precisa definir dia de vencimento"
          />

          <DashboardCard
            titulo="Inativos"
            valor={resumoAlunos.inativosFinanceiro + resumoAlunos.inativosManuais}
            subtitulo={`${resumoAlunos.inativosFinanceiro} financeiro • ${resumoAlunos.inativosManuais} manual`}
          />
        </div>
      </section>

      {/* Estatísticas gerais */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-50">Estatísticas gerais</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#111111] border border-zinc-700 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Treinos registrados
            </div>
            <div className="mt-1 text-2xl font-semibold text-zinc-50">
              {totalTreinos}
            </div>
          </div>
          <div className="rounded-2xl bg-[#111111] border border-zinc-700 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              PDFs enviados
            </div>
            <div className="mt-1 text-2xl font-semibold text-zinc-50">
              {totalDocumentos}
            </div>
          </div>
        </div>
      </section>

      {/* Configuração de capacidade */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-50">Capacidade de alunos</h2>
        <div className="rounded-2xl bg-[#111111] border border-zinc-700 p-5 max-w-md">
          <form action={salvarConfig} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="limiteAlunos" className="text-sm text-zinc-300">
                Limite de alunos
              </label>
              <input
                id="limiteAlunos"
                name="limiteAlunos"
                type="number"
                min={1}
                defaultValue={config.limiteAlunos}
                required
                className="w-full rounded-xl border border-zinc-700 bg-[#0d0d0d] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              />
            </div>
            <button 
              type="submit"
              className="w-full rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-black shadow-[0_0_18px_rgba(249,115,22,0.5)] hover:bg-orange-400 transition"
            >
              Salvar
            </button>
          </form>
          <p className="mt-4 text-xs text-zinc-500">
            Registro criado em {new Date(config.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.
          </p>
        </div>
      </section>
    </div>
  );
}
