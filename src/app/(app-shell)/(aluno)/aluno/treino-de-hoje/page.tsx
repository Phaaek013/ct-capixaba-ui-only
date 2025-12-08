import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TreinoDeHojePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Treino de hoje</h1>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Treino A - Peito e Tríceps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Série de exercícios focada no desenvolvimento de peitoral e tríceps.</p>
          <p>Tempo estimado: 45–60 minutos.</p>
        </CardContent>
      </Card>
    </div>
  );
}
