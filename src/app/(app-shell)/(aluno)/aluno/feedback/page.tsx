import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Histórico de feedbacks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Aqui você vai listar os feedbacks que o aluno enviou e, se houver, as respostas do coach.</p>
        </CardContent>
      </Card>
    </div>
  );
}
