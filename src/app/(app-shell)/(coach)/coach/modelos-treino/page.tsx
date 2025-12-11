import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import CoachModelosTreinoClient from "./CoachModelosTreinoClient";
import { TreinoModelo } from "@/types/treino";
import { parseConteudo } from "@/lib/treino-conteudo";

export default async function ModelosTreinoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.tipo !== TipoUsuario.Coach) {
    redirect("/login");
  }

  const coachId = parseInt(session.user.id, 10);

  // Busca todos os modelos de treino do coach (ehModelo = true)
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 pb-24">
      <CoachModelosTreinoClient modelosIniciais={modelos} />
    </div>
  );
}
