import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import HeaderBrand from "@/components/HeaderBrand";
import { AppFooter } from "@/components/layout/AppFooter";
import "../../styles/brand.css";
import "../../styles/dark-theme.css";

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#050505] text-zinc-50">
      {/* Header só aparece se tiver sessão */}
      {session?.user && <HeaderBrand />}

      <main className="w-full flex-1">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}
