import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { authOptions } from "@/auth";
import { TipoUsuario } from "@/types/tipo-usuario";
import { PageHeader } from "@/components/ui/page-header";
import TreinoHojeAlunoClient from "./TreinoHojeAlunoClient";

export default async function TreinoDeHojePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  const hoje = new Date();
  const dataHojeISO = format(hoje, "yyyy-MM-dd");

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-28 space-y-4">
      <PageHeader
        title="Treino de hoje"
        description={format(hoje, "EEEE, d 'de' MMMM", { locale: ptBR })}
      />

      <TreinoHojeAlunoClient dataHoje={dataHojeISO} />
    </div>
  );
}
