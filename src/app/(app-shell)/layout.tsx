import type { ReactNode } from "react";
import HeaderBrand from "@/components/HeaderBrand";
import "../../styles/brand.css";
import "../../styles/dark-theme.css";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderBrand />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {year} CT Capixaba · Desenvolvido por <span className="font-semibold">Vortix.IA</span>
      </footer>
    </div>
  );
}
