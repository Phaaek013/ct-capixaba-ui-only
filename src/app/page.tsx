import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { TipoUsuario } from "@/types/tipo-usuario";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.senhaPrecisaTroca) {
    redirect("/primeiro-acesso/alterar-senha");
  }

  if (session.user.tipo === TipoUsuario.Coach) {
    redirect("/coach");
  }

  redirect("/aluno");
}
