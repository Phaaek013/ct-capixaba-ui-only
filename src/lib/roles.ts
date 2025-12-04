import { requireAuth } from "./auth";
import { redirect } from "next/navigation";
import { TipoUsuario } from "@/types/tipo-usuario";

export async function assertCoach() {
  const session = await requireAuth();
  if (session.user?.tipo !== TipoUsuario.Coach) {
    if (session.user?.tipo === TipoUsuario.Aluno) {
      redirect("/aluno");
    }
    redirect("/login");
  }
  return session;
}
