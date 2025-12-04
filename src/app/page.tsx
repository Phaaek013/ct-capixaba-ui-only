// src/app/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { TipoUsuario } from "@/types/tipo-usuario";

// garante que essa página NUNCA seja renderizada estaticamente
export const dynamic = "force-dynamic";

export default async function Home() {
  // NADA de chamar getServerSession fora desta função
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // dependendo de como o session.user.tipo vem, tratamos os dois jeitos
  const tipo = (session.user as any)?.tipo as TipoUsuario | string | undefined;

  if (tipo === TipoUsuario.Coach || tipo === "Coach") {
    redirect("/coach");
  }

  // default: aluno
  redirect("/aluno");
}
