"use client";

import { useMemo } from "react";
import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { CalendarDays, FileText, MessageCircle, User } from "lucide-react";
import TreinoHojeResumoAlunoClient from "./TreinoHojeResumoAlunoClient";

const NAV_ITEMS = [
  { href: "/aluno/perfil", icon: User, label: "Perfil" },
  { href: "/aluno/pdfs", icon: FileText, label: "PDFs" },
  { href: "/aluno/feedback", icon: MessageCircle, label: "Feedback" },
  { href: "/aluno/calendario", icon: CalendarDays, label: "Calendário" }
] as const;

function getInitial(name?: string | null, email?: string | null) {
  if (name && name.trim().length > 0) {
    return name.trim()[0]!.toUpperCase();
  }
  if (email && email.trim().length > 0) {
    return email.trim()[0]!.toUpperCase();
  }
  return "?";
}

export type UltimoTreinoResumo = {
  id: string;
  title: string;
  date: string;
};

export type AlunoHomeClientProps = {
  alunoNome: string;
  alunoEmail: string;
  alunoAvatarUrl?: string | null;
  dataHojeISO: string;
  alunoId: number;
  ultimosTreinos: UltimoTreinoResumo[];
};

export function AlunoHomeClient({
  alunoNome,
  alunoEmail,
  alunoAvatarUrl,
  dataHojeISO,
  alunoId,
  ultimosTreinos
}: AlunoHomeClientProps) {
  const router = useRouter();

  const initials = useMemo(() => {
    if (alunoNome && alunoNome.trim().length > 0) {
      return alunoNome
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0]!.toUpperCase())
        .slice(0, 2)
        .join("");
    }
    return getInitial(alunoNome, alunoEmail);
  }, [alunoNome, alunoEmail]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/aluno/perfil" className="flex items-center gap-3 transition hover:opacity-90">
          {alunoAvatarUrl ? (
            <img
              src={alunoAvatarUrl}
              alt={`${alunoNome} avatar`}
              className="h-12 w-12 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-black">
              {initials}
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Meu treino</span>
            <span className="text-sm font-semibold text-foreground">{alunoNome}</span>
            <span className="text-xs text-muted-foreground">{alunoEmail}</span>
          </div>
        </Link>

        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">Bem-vindo ao CT Capixaba</h1>
          <p className="text-sm text-muted-foreground">Aqui você acompanha seus treinos e evolução</p>
        </div>
      </header>

      {/* Card principal de treino do dia - agora busca da API */}
      <TreinoHojeResumoAlunoClient dataHoje={dataHojeISO} alunoId={alunoId} />

      {/* 4 cards de ação rápida - SEMPRE 4 na mesma linha */}
      <section>
        <div className="mx-auto max-w-sm">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold tracking-tight">Últimos treinos</h2>
        {ultimosTreinos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum treino registrado ainda.</p>
        ) : (
          <div className="space-y-5">
            {ultimosTreinos.map((workout) => (
              <Card
                key={workout.id}
                className="flex flex-col justify-between bg-card/90 shadow-md sm:flex-row sm:items-center"
              >
                <div className="flex flex-col gap-1 p-6">
                  <p className="text-lg font-semibold">{workout.title}</p>
                  <p className="text-sm text-muted-foreground">{workout.date}</p>
                </div>
                <div className="px-6 pb-4 sm:pb-0">
                  <Button
                    asChild
                    className="rounded-full bg-orange-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-orange-700"
                  >
                    <Link href={`/aluno/treinos/${workout.id}`}>Ver treino</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
};

function NavItem({ href, icon: Icon, label }: NavItemProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-1 text-center transition-colors duration-300 hover:text-foreground focus-visible:text-foreground"
    >
      {/* Círculo responsivo: menor em mobile, maior em telas maiores */}
      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#1f1f1f] shadow-lg transition-colors duration-300 group-hover:bg-[#2a2a2a] group-focus-visible:bg-[#2a2a2a]">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
      </div>
      {/* Label com fonte pequena para caber */}
      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground leading-tight">{label}</span>
    </Link>
  );
}
