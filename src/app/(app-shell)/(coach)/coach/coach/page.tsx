import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TipoUsuario } from "@/types/tipo-usuario";
import { Card, PageHeader } from "@/components/ui";

export default async function CoachPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  if (session.user.tipo !== TipoUsuario.Coach) {
    redirect("/aluno");
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <PageHeader title="Área do Coach" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 cursor-pointer hover:bg-card/80 transition-colors">
          <a href="/coach/treinos" className="block text-lg font-semibold text-primary hover:underline">
            Treinos
          </a>
        </Card>
        <Card className="p-6 cursor-pointer hover:bg-card/80 transition-colors">
          <a href="/coach/alunos" className="block text-lg font-semibold text-primary hover:underline">
            Alunos
          </a>
        </Card>
        <Card className="p-6 cursor-pointer hover:bg-card/80 transition-colors">
          <a href="/coach/feedback" className="block text-lg font-semibold text-primary hover:underline">
            Feedback
          </a>
        </Card>
        <Card className="p-6 cursor-pointer hover:bg-card/80 transition-colors">
          <a href="/coach/pdfs" className="block text-lg font-semibold text-primary hover:underline">
            PDFs
          </a>
        </Card>
      </div>
    </div>
  );
}
