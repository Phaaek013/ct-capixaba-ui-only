import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resumirDestinatarios } from "@/lib/pdfs";
import { TipoUsuario } from "@/types/tipo-usuario";

import { CoachPdfsClient } from "./CoachPdfsClient";

export default async function CoachPdfsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const coach = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: { id: true, tipo: true }
  });

  if (!coach || (coach.tipo !== TipoUsuario.Coach && coach.tipo !== TipoUsuario.Admin)) {
    redirect("/aluno");
  }

  const [alunos, documentos] = await Promise.all([
    prisma.usuario.findMany({
      where: { tipo: TipoUsuario.Aluno },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" }
    }),
    prisma.documentoPDF.findMany({
      orderBy: { dataEnvio: "desc" },
      include: {
        alunos: {
          select: { id: true, nome: true }
        }
      }
    })
  ]);

  const historico = documentos.map((documento) => ({
    id: documento.id,
    titulo: documento.titulo,
    enviadoEmISO: documento.dataEnvio.toISOString(),
    qtdDestinatarios: documento.alunos.length,
    destinatariosResumo: resumirDestinatarios(documento.alunos.map((aluno) => aluno.nome)),
    url: documento.filePath,
    destinatariosIds: documento.alunos.map((aluno) => aluno.id)
  }));

  return (
    <div className="min-h-screen bg-[#050608] px-4 pt-6 pb-28 text-white">
      <div className="mx-auto max-w-5xl">
        <CoachPdfsClient alunos={alunos} historico={historico} />
      </div>
    </div>
  );
}
