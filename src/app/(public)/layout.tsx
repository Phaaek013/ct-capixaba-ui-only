// app/(public)/layout.tsx
import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#05070b] text-foreground">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <AppFooter />
    </div>
  );
}
