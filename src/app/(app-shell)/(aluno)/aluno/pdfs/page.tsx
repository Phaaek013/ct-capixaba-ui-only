import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PdfsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Meus PDFs</h1>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Documentos enviados pelo coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Lista de PDFs com nome, data de envio e botão para visualizar / baixar.</p>
          <p>Por enquanto, você pode deixar uma lista fictícia.</p>
        </CardContent>
      </Card>
    </div>
  );
}
