import Link from "next/link";
import { assertCoach } from "@/lib/roles";
import { PageHeader, Card, CardContent } from "@/components/ui";

export default async function CoachDashboard() {
  const session = await assertCoach();

  const navItems = [
    { href: "/coach/alunos", label: "Gerenciar alunos", description: "Adicione e gerencie seus alunos" },
    { href: "/coach/treinos", label: "Treinos", description: "Crie e envie treinos para seus alunos" },
    { href: "/coach/feedback", label: "Feedbacks", description: "Veja os feedbacks dos alunos" },
    { href: "/coach/modelos", label: "Modelos de treino", description: "Crie modelos reutilizáveis" },
    { href: "/coach/pdfs", label: "PDFs", description: "Compartilhe documentos com seus alunos" },
    { href: "/coach/config", label: "Configurações", description: "Configure sua conta" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${session.user?.name}`}
        description={session.user?.email ?? ''}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group"
          >
            <Card className="h-full transition-all duration-200 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-600/10">
              <CardContent className="p-6 space-y-2">
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-orange-600 transition-colors">
                  {item.label}
                </h3>
                <p className="text-sm text-zinc-400">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
