import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CT Capixaba",
  description: "App de treinos do CT Capixaba",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
