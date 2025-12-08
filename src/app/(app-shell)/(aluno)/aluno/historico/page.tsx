import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoricoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Histórico de treinos</h1>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Todos os treinos realizados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Tabela ou lista com todos os treinos do aluno, filtrar por período, etc. No MVP basta uma listinha.</p>
        </CardContent>
      </Card>
    </div>
  );
}
