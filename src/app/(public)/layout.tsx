// app/(public)/layout.tsx
import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#05070b] text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
