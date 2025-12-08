import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerfilPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Meu perfil</h1>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Dados do aluno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Nome, e-mail, telefone, data de nascimento…</p>
          <p>Aqui o coach/aluno poderão editar informações básicas de cadastro.</p>
        </CardContent>
      </Card>
    </div>
  );
}
