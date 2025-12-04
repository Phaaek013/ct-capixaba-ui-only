// src/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TipoUsuario } from "@/types/tipo-usuario";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Usa o helper oficial do NextAuth v5 para App Router
  const session = await auth();

  // Se não estiver logado, manda pro login
  if (!session?.user) {
    redirect("/login");
  }

  // A gente já sabe que tem usuário aqui
  const tipo = (session.user as any).tipo as TipoUsuario | undefined;

  if (tipo === TipoUsuario.Coach || tipo === TipoUsuario.Admin) {
    redirect("/coach");
  }

  if (tipo === TipoUsuario.Aluno) {
    redirect("/aluno");
  }

  // Fallback paranoico: se por algum motivo não tiver tipo, joga pro login
  redirect("/login");
}
