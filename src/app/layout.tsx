import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CT Capixaba",
  description: "Sistema de treinos do CT Capixaba",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} bg-[#050505] text-zinc-50 antialiased min-h-screen`}
      >
        <div className="w-full">{children}</div>
      </body>
    </html>
  );
}
