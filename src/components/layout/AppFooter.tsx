"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Prefixos de rotas onde o footer deve ser escondido (telas com FAB)
const HIDE_ON_PREFIXES = [
  "/coach/alunos",
  "/coach/treinos",
  "/coach/feedbacks",
  "/coach/modelos-treino",
  "/coach/pdfs",
  // Proteção para o aluno caso volte a usar footer:
  "/aluno/treinos",
  "/aluno/calendario",
  "/aluno/pdfs",
  "/aluno/feedback",
];

export function AppFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // Esconde completamente o footer nas telas com FAB
  const shouldHide = HIDE_ON_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (shouldHide) {
    return null;
  }

  return (
    <footer className="w-full border-t border-zinc-800 px-4 py-4 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
        <span className="text-center sm:text-left">
          © {year} CT Capixaba · Desenvolvido por{" "}
          <span className="font-semibold text-zinc-300">Vortix.IA</span>
        </span>

        <nav className="flex items-center gap-4">
          <Link
            href="/faq"
            className="text-orange-400 text-sm hover:underline"
          >
            FAQ
          </Link>
          <Link
            href="/termos"
            className="text-orange-400 text-sm hover:underline"
          >
            Termos de uso
          </Link>
          <Link
            href="/privacidade"
            className="text-orange-400 text-sm hover:underline"
          >
            Política de privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
}
