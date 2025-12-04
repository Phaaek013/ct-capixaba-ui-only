import { prisma } from "@/lib/prisma";
import { criarTreino } from "./actions";
import Link from "next/link";
import { assertCoach } from "@/lib/roles";
import { PageHeader, Card, CardHeader, CardTitle, CardContent, Label, Input, Button, Alert } from "@/components/ui";

interface PageProps {
  searchParams?: Record<string, string | string[]>;
}

function formatarData(data: Date) {
  return data.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function TreinosPage({ searchParams }: PageProps) {
  await assertCoach();

  const origemId = Number(typeof searchParams?.origem === "string" ? searchParams?.origem : 0) || null;
  const mensagemErro = typeof searchParams?.error === "string" ? searchParams?.error : null;
  const mensagemSucesso = typeof searchParams?.sucesso === "string" ? searchParams?.sucesso : null;

  const [alunos, treinos, origemTreino] = await Promise.all([
    prisma.usuario.findMany({ where: { tipo: 'Aluno' }, orderBy: { nome: "asc" } }),
    prisma.treino.findMany({
      where: { ehModelo: false },
      include: { aluno: true },
      orderBy: { dataTreino: "desc" },
      take: 30
    }),
    origemId
      ? prisma.treino.findUnique({ where: { id: origemId }, include: { aluno: true } })
      : Promise.resolve(null)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Treinos" />

      {mensagemErro === "invalid" && (
        <Alert variant="error">Informe aluno, data e conteúdo.</Alert>
      )}
      {mensagemErro === "duplicado" && (
        <Alert variant="error">Já existe um treino para este aluno nesta data.</Alert>
      )}
      {mensagemSucesso && (
        <Alert variant="success">Treino salvo com sucesso.</Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cadastrar treino</CardTitle>
          {origemTreino && (
            <p className="text-sm text-zinc-400 mt-2">
              Duplicando treino #{origemTreino.id} de {origemTreino.aluno?.nome ?? "Modelo"}.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form action={criarTreino} className="space-y-4">
            <input type="hidden" name="origemTreinoId" value={origemTreino?.id ?? ""} />

            <div>
              <Label htmlFor="alunoId">Aluno</Label>
              <select
                id="alunoId"
                name="alunoId"
                defaultValue=""
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="" disabled>
                  Selecione um aluno
                </option>
                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dataTreino">Data do treino</Label>
              <Input id="dataTreino" name="dataTreino" type="date" required />
            </div>

            <div>
              <Label htmlFor="conteudo">Conteúdo</Label>
              <textarea
                id="conteudo"
                name="conteudo"
                rows={6}
                required
                defaultValue={origemTreino?.conteudo ?? ""}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">URL do vídeo (opcional)</Label>
              <Input id="videoUrl" name="videoUrl" defaultValue={origemTreino?.videoUrl ?? ""} />
            </div>

            <Button type="submit">Salvar treino</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos treinos</CardTitle>
        </CardHeader>
        <CardContent>
          {treinos.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhum treino cadastrado ainda.</p>
          ) : (
            <ul className="space-y-4">
              {treinos.map((treino) => (
                <li key={treino.id} className="rounded-md border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-100">{treino.aluno?.nome ?? "Aluno removido"}</p>
                      <p className="text-sm text-zinc-500">{formatarData(treino.dataTreino ?? new Date())}</p>
                    </div>
                    <Link href={`/coach/treinos?origem=${treino.id}`}>
                      <Button variant="secondary" size="sm">
                        Duplicar
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-zinc-300">{treino.conteudo}</p>
                  {treino.videoUrl && (
                    <a
                      href={treino.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm text-orange-600 hover:text-orange-500 transition-colors"
                    >
                      Ver vídeo →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
