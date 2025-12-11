import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { TipoUsuario } from "@/types/tipo-usuario";
import { format } from "date-fns";
import { WorkoutCalendarClient } from "./WorkoutCalendarClient";

export default async function CalendarioTreinosPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  const dataInicialISO = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <WorkoutCalendarClient dataInicialISO={dataInicialISO} />
    </div>
  );
}
