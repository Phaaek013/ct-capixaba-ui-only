import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { toEmbed } from '@/lib/youtube';
import dynamic from 'next/dynamic';
import { createFeedback, updateFeedback } from './actions';
import FeedbackSection from './feedback-section';
import AlunoTreinoCache from './AlunoTreinoCache';
import { prisma } from '@/lib/prisma';
import { TIMEZONE, getTodayRangeInTZ } from '@/lib/tz';
import { TipoUsuario } from '@/types/tipo-usuario';
import { Card, CardHeader, CardTitle, CardContent, PageHeader } from '@/components/ui';

const YouTubeEmbed = dynamic(() => import('@/components/YouTubeEmbed'), { ssr: false });

export default async function AlunoPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect('/login');
    }

    if (session.user.tipo !== TipoUsuario.Aluno) {
      redirect('/coach');
    }

    const alunoId = Number(session.user.id);
  const { startUtc: gte, endUtc: lt } = getTodayRangeInTZ(TIMEZONE);

    const treino = await prisma.treino.findFirst({
      where: {
        alunoId,
        ehModelo: false,
        dataTreino: {
          gte,
          lt
        }
      }
    });

    const feedback = treino
      ? await prisma.feedback.findUnique({
          where: {
            alunoId_treinoId: {
              alunoId,
              treinoId: treino.id
            }
          }
        })
      : null;

    const pdfs = await prisma.documentoPDF.findMany({
      where: {
        alunos: {
          some: {
            id: alunoId
          }
        }
      },
      orderBy: {
        dataEnvio: 'desc'
      }
    });

    const videoEmbed = treino?.videoUrl ? toEmbed(treino.videoUrl) : null;

    const historico = await prisma.treino.findMany({
      where: {
        alunoId,
        ehModelo: false
      },
      include: { aluno: true },
      orderBy: { dataTreino: 'desc' },
      take: 10
    });

    return (
      <div className="space-y-6">
        <PageHeader
          title="Meu Treino"
          description={session.user.email ?? ''}
        />

        <Card>
          <CardHeader>
            <CardTitle>Treino de hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {treino ? (
              <>
                <textarea
                  className="h-48 w-full resize-none rounded-md border border-zinc-700 bg-zinc-800 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  readOnly
                  value={treino.conteudo}
                />
                <AlunoTreinoCache
                  alunoId={alunoId}
                  dataTreinoISO={treino.dataTreino?.toISOString()}
                  conteudo={treino.conteudo}
                  videoUrl={treino.videoUrl ?? undefined}
                />
                {videoEmbed && (
                  <YouTubeEmbed embedUrl={videoEmbed} videoUrl={treino.videoUrl ?? undefined} />
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-400">Sem treino para hoje.</p>
                <AlunoTreinoCache alunoId={alunoId} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {treino ? (
              <FeedbackSection
                treinoId={treino.id}
                feedback={feedback}
                createAction={createFeedback}
                updateAction={updateFeedback}
              />
            ) : (
              <p className="text-sm text-zinc-400">
                Envie seu feedback quando um treino estiver disponível.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus PDFs</CardTitle>
          </CardHeader>
          <CardContent>
            {pdfs.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum documento disponível.</p>
            ) : (
              <ul className="space-y-4">
                {pdfs.map((pdf) => (
                  <li key={pdf.id} className="space-y-2 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-zinc-100">{pdf.titulo}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(pdf.dataEnvio).toLocaleString('pt-BR', {
                        timeZone: TIMEZONE
                      })}
                    </p>
                    <Link
                      href={pdf.filePath}
                      target="_blank"
                      className="inline-block text-sm text-orange-600 hover:text-orange-500 transition-colors"
                    >
                      Abrir documento →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos treinos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historico && historico.length > 0 ? (
                historico
                  .filter((h) => !treino || h.id !== treino.id)
                  .map((h) => (
                    <article key={h.id} className="rounded-md border border-zinc-800 bg-zinc-900/30 p-4 space-y-2">
                      <p className="text-sm font-medium text-zinc-100">
                        {h.aluno?.nome ?? session.user.name ?? session.user.email}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {h.dataTreino
                          ? new Date(h.dataTreino).toLocaleDateString('pt-BR', { timeZone: TIMEZONE })
                          : ''}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{h.conteudo}</p>
                      {h.videoUrl && (
                        <a
                          href={h.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-2 text-sm text-orange-600 hover:text-orange-500 transition-colors"
                        >
                          Ver vídeo →
                        </a>
                      )}
                    </article>
                  ))
              ) : (
                <p className="text-sm text-zinc-400">Nenhum treino anterior encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar página do aluno:', error);
    return (
      <div className="space-y-6">
        <PageHeader
          title="Erro"
          description="Ocorreu um erro ao carregar seus dados."
        />
      </div>
    );
  }
}
