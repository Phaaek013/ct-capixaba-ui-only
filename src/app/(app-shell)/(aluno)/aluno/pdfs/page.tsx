import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";

import { AlunoPdfsClient } from "./AlunoPdfsClient";

export default async function AlunoPdfsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  const pdfs = await prisma.pdfDocumento.findMany({
    orderBy: { criadoEm: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#050608] pt-6 text-white">
      <AlunoPdfsClient pdfs={pdfs} />
    </div>
  );
}
