"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  Users,
  Dumbbell,
  MessageSquare,
  BookOpen,
  FileText,
  Settings,
  UserCircle2
} from "lucide-react";

type CoachHomeProps = {
  nome: string;
  email: string;
  avatarUrl?: string | null;
};

const NAV_CARDS = [
  {
    key: "alunos",
    title: "Alunos",
    description: "Gerenciar cadastro e acesso",
    href: "/coach/alunos",
    Icon: Users
  },
  {
    key: "treino-do-dia",
    title: "Treino do dia",
    description: "Criar e aplicar o treino do dia",
    href: "/coach/treinos",
    Icon: Dumbbell
  },
  {
    key: "feedbacks",
    title: "Feedbacks",
    description: "Ler e responder os alunos",
    href: "/coach/feedbacks",
    Icon: MessageSquare
  },
  {
    key: "modelos-treino",
    title: "Modelos de treino",
    description: "Biblioteca de treinos",
    href: "/coach/modelos-treino",
    Icon: BookOpen
  },
  {
    key: "pdfs",
    title: "PDFs",
    description: "Enviar e gerenciar PDFs",
    href: "/coach/pdfs",
    Icon: FileText
  },
  {
    key: "configuracoes",
    title: "Configurações",
    description: "Dashboard e configurações",
    href: "/coach/config",
    Icon: Settings
  }
];

function getPrimeiroNome(nome: string) {
  const [primeiro] = nome.trim().split(" ");
  return primeiro || "Coach";
}

export default function CoachHomeClient({ nome, email, avatarUrl = null }: CoachHomeProps) {
  const primeiroNome = getPrimeiroNome(nome);

  return (
    <section className="w-full pb-10">
      <header className="w-full border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-zinc-400">Olá, {primeiroNome}!</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-zinc-50 leading-tight">
              Pronto para começar o dia?
            </h1>
            {email && (
              <p className="mt-1 text-[11px] sm:text-xs text-zinc-500">
                {email}
              </p>
            )}
          </div>

          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={nome}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto pt-6">
          {NAV_CARDS.map(({ key, title, description, href, Icon }) => (
            <Link
              key={key}
              href={href}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-zinc-950 rounded-2xl"
            >
              <Card className="h-full rounded-2xl sm:rounded-3xl bg-zinc-900/85 border border-zinc-800/90 hover:border-orange-500/70 hover:bg-zinc-900 transition-colors">
                <div className="flex flex-col h-full p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h2 className="text-sm sm:text-base md:text-lg font-semibold text-zinc-50 leading-snug">
                      {title}
                    </h2>
                  </div>

                  <p className="mt-3 text-[11px] sm:text-xs md:text-sm text-zinc-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
