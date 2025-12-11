"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, MessageCircle, User, FileText } from "lucide-react";

const navItems = [
  {
    href: "/aluno",
    label: "Home",
    icon: Home
  },
  {
    href: "/aluno/calendario",
    label: "Treinos",
    icon: Dumbbell
  },
  {
    href: "/aluno/pdfs",
    label: "PDFs",
    icon: FileText
  },
  {
    href: "/aluno/feedback",
    label: "Feedback",
    icon: MessageCircle
  },
  {
    href: "/aluno/perfil",
    label: "Perfil",
    icon: User
  }
];

export function AlunoBottomNav() {
  const pathname = usePathname();

  if (!pathname.startsWith("/aluno") || pathname === "/aluno") {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center">
      <div className="flex w-[min(480px,100%-2rem)] items-center justify-between rounded-full border border-white/10 bg-black/80 px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const baseClasses = "flex flex-col items-center gap-1 text-[0.7rem] transition-colors";
          const stateClasses = isActive ? "text-orange-400" : "text-muted-foreground hover:text-orange-300";
          const iconBase = "h-5 w-5 mb-0.5 transition-colors rounded-full border";
          const iconState = isActive ? "border-orange-400 bg-orange-500/10" : "border-transparent bg-transparent";
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className={`${baseClasses} ${stateClasses}`}>
              <Icon className={`${iconBase} ${iconState}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
