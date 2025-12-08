import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { TipoUsuario } from "@/types/tipo-usuario";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, FileText, MessageCircle, History } from "lucide-react";
import type React from "react";
import { LAST_WORKOUTS } from "./workouts";

type NavItemProps = {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
};

function getInitial(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    return name.trim()[0]!.toUpperCase();
  }
  if (email && email.trim().length > 0) {
    return email.trim()[0]!.toUpperCase();
  }
  return "?";
}

export default async function AlunoDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  const email = session.user.email ?? "";
  const name = session.user.name ?? "";
  const avatarInitial = getInitial(name, email);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
      <header className="flex items-center gap-4">
        <Link href="/aluno/perfil" className="group flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground shadow">
            {avatarInitial}
          </div>
          <span className="text-[11px] text-muted-foreground group-hover:text-foreground">Meu perfil</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Treino</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </header>

      <Card className="bg-card/80 border-border">
        <CardHeader className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Disponível para iniciar</p>
          <CardTitle className="text-xl">Treino A - Peito e Tríceps</CardTitle>
          <CardDescription className="text-sm">
            Série de exercícios focada no desenvolvimento de peitoral e tríceps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/aluno/treino-de-hoje">
            <Button className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-medium">
              Iniciar treino
            </Button>
          </Link>
        </CardContent>
      </Card>

      <section>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          <NavItem href="/aluno/perfil" icon={User} label="Meu perfil" />
          <NavItem href="/aluno/pdfs" icon={FileText} label="Meus PDFs" />
          <NavItem href="/aluno/feedback" icon={MessageCircle} label="Feedback" />
          <NavItem href="/aluno/historico" icon={History} label="Histórico" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Últimos treinos</h2>
        <div className="space-y-3">
          {LAST_WORKOUTS.map((workout) => (
            <Card key={workout.id} className="flex items-center justify-between bg-card/80">
              <div className="flex flex-col gap-1 p-4">
                <p className="text-sm font-medium">{workout.title}</p>
                <p className="text-xs text-muted-foreground">{workout.date}</p>
              </div>
              <div className="px-4">
                <Link href={`/aluno/treinos/${workout.id}`}>
                  <Button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">
                    Ver treino
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }: NavItemProps) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#121212] shadow-md">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </Link>
  );
}
