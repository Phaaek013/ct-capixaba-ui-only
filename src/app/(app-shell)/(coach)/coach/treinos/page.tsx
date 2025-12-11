import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import CoachTreinoDoDiaClient from "./CoachTreinoDoDiaClient";
import { TreinoBase, TreinoModelo } from "@/types/treino";
import { parseConteudo } from "@/lib/treino-conteudo";

function formatISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function TreinosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.tipo !== TipoUsuario.Coach) {
    redirect("/login");
  }

  const coachId = parseInt(session.user.id, 10);

  // HOJE como data inicial
  const hoje = new Date();
  const dataHojeISO = formatISODate(hoje);

  // Busca início e fim do dia
  const inicioDia = new Date(dataHojeISO + "T00:00:00.000Z");
  const fimDia = new Date(dataHojeISO + "T23:59:59.999Z");

  // Busca treinos do dia de hoje (treinos aplicados = ehModelo false e tem aluno)
  const treinosHojeDb = await prisma.treino.findMany({
    where: {
      coachId,
      ehModelo: false,
      dataTreino: {
        gte: inicioDia,
        lte: fimDia,
      },
      aluno: {
        isNot: null,
      },
    },
    include: {
      aluno: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Agrupa treinos por conteúdo similar para mostrar "X alunos"
  const treinosAgrupados = new Map<string, TreinoBase>();
  
  for (const t of treinosHojeDb) {
    const parsed = parseConteudo(t.conteudo);
    const key = t.nomeModelo || parsed.foco || (t.conteudo ?? "").slice(0, 50);
    
    if (treinosAgrupados.has(key)) {
      const existing = treinosAgrupados.get(key)!;
      if (t.aluno) {
        existing.alunoIds.push(String(t.aluno.id));
        const nomes = [...new Set([...existing.alunosResumo.split(", ").slice(0, 3), t.aluno.nome])];
        existing.alunosResumo = `${existing.alunoIds.length} aluno(s): ${nomes.slice(0, 3).join(", ")}${nomes.length > 3 ? "..." : ""}`;
      }
    } else {
      treinosAgrupados.set(key, {
        id: String(t.id),
        titulo: t.nomeModelo || parsed.foco || "Treino",
        data: dataHojeISO,
        alunosResumo: t.aluno ? `1 aluno(s): ${t.aluno.nome}` : "Nenhum aluno vinculado",
        alunoIds: t.aluno ? [String(t.aluno.id)] : [],
        foco: parsed.foco ?? null,
        mobilidade: parsed.mobilidade ?? null,
        aquecimento: parsed.aquecimento ?? null,
        skillForca: parsed.skillForca ?? null,
        wod: parsed.wod ?? null,
        alongamento: parsed.alongamento ?? null,
        videoUrl: t.videoUrl ?? parsed.videoUrl ?? null,
        modeloId: t.ehModelo ? String(t.id) : null,
      });
    }
  }

  const treinosHoje: TreinoBase[] = Array.from(treinosAgrupados.values());

  // Alunos disponíveis para seleção
  const alunos = await prisma.usuario.findMany({
    where: { 
      tipo: TipoUsuario.Aluno,
    },
    select: { id: true, nome: true, email: true },
    orderBy: { nome: "asc" },
  });

  // Modelos de treino (treinos com ehModelo = true, do coach atual)
  const modelosDb = await prisma.treino.findMany({
    where: { coachId, ehModelo: true },
    orderBy: { nomeModelo: "asc" },
  });

  const modelos: TreinoModelo[] = modelosDb.map((m) => {
    const parsed = parseConteudo(m.conteudo);
    return {
      id: String(m.id),
      titulo: m.nomeModelo || parsed.foco || "Modelo sem nome",
      foco: parsed.foco ?? null,
      mobilidade: parsed.mobilidade ?? null,
      aquecimento: parsed.aquecimento ?? null,
      skillForca: parsed.skillForca ?? null,
      wod: parsed.wod ?? null,
      alongamento: parsed.alongamento ?? null,
      videoUrl: m.videoUrl ?? parsed.videoUrl ?? null,
    };
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-0 pb-24">
      <CoachTreinoDoDiaClient
        dataInicialISO={dataHojeISO}
        treinosIniciais={treinosHoje}
        alunos={alunos.map(a => ({ ...a, id: String(a.id) }))}
        modelos={modelos}
      />
    </div>
  );
}
