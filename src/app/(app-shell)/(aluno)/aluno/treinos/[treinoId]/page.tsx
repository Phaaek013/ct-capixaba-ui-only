import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { TipoUsuario } from "@/types/tipo-usuario";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WORKOUT_DETAILS } from "../../workouts";
import { CompleteWorkoutButton } from "./CompleteWorkoutButton";

type Params = {
  params: {
    treinoId: string;
  };
};

export default async function TreinoDetailPage({ params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.tipo !== TipoUsuario.Aluno) {
    redirect("/login");
  }

  const treinoId = params.treinoId;
  const treino = WORKOUT_DETAILS[treinoId];

  if (!treino) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Plano do dia</p>
          <h1 className="text-3xl font-bold tracking-tight">{treino.title}</h1>
          <p className="text-sm text-muted-foreground">{treino.focus}</p>
        </div>
        <Link href="/aluno">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card className="bg-card/80 border-border">
        <CardHeader>
          <CardTitle>Informações gerais</CardTitle>
          <CardDescription>Duração estimada: {treino.duration}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mantenha o tempo de descanso entre 60 e 90 segundos para exercícios compostos e até 45 segundos
            para os isolados. Foque na execução controlada para maximizar o estímulo muscular.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Sequência de exercícios</h2>
        <div className="space-y-3">
          {treino.exercises.map((exercise, index) => (
            <Card key={`${treinoId}-${index}`} className="bg-card/80 border-border">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">{exercise.reps}</p>
                </div>
                <CompleteWorkoutButton treinoId={`${treinoId}:${exercise.name}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
