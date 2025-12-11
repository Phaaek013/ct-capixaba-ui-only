import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import CoachHomeClient from "./CoachHomeClient";

export default async function CoachHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const coach = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: {
      nome: true,
      email: true,
      avatarUrl: true,
    },
  });

  const nome = coach?.nome ?? session.user.name ?? "Treinador";
  const email = coach?.email ?? session.user.email;
  const avatarUrl = coach?.avatarUrl ?? null;

  return (
    <div className="py-8">
      <CoachHomeClient nome={nome} email={email} avatarUrl={avatarUrl} />
    </div>
  );
}
