import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Uso | CT Capixaba",
  description: "Termos de uso do aplicativo CT Capixaba.",
};

export default function TermosPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-xs text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Última atualização: Dezembro de 2025
        </p>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8 text-sm leading-relaxed text-zinc-300">
        {/* 1. Quem somos */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            1. Quem somos
          </h2>
          <p>
            O CT Capixaba é um centro de treinamento especializado em preparação física e 
            condicionamento. Este aplicativo é uma extensão digital dos serviços prestados 
            presencialmente, permitindo que alunos acompanhem seus treinos, recebam 
            orientações e mantenham comunicação com seus coaches.
          </p>
        </section>

        {/* 2. Objeto do aplicativo */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            2. Objeto do aplicativo
          </h2>
          <p className="mb-3">O aplicativo CT Capixaba tem como finalidade:</p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Disponibilizar treinos personalizados elaborados pelo coach;</li>
            <li>Registrar feedbacks e mensagens entre aluno e coach;</li>
            <li>Disponibilizar materiais complementares (PDFs);</li>
            <li>Controlar acesso conforme situação cadastral do aluno.</li>
          </ul>
          <p className="mt-3 rounded border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
            <strong>Importante:</strong> O uso do aplicativo não substitui avaliação médica. 
            Consulte sempre um profissional de saúde antes de iniciar ou modificar 
            qualquer programa de exercícios.
          </p>
        </section>

        {/* 3. Cadastro e acesso */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            3. Cadastro e acesso do aluno
          </h2>
          <p className="mb-3">
            A conta do aluno é criada pelo coach ou pela administração do CT Capixaba. 
            O aluno é responsável por:
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Manter sua senha em sigilo;</li>
            <li>Não compartilhar suas credenciais de acesso;</li>
            <li>Comunicar imediatamente ao coach em caso de suspeita de uso indevido da conta.</li>
          </ul>
        </section>

        {/* 4. Uso adequado */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            4. Uso adequado do aplicativo
          </h2>
          <p className="mb-3">É proibido:</p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Tentar acessar contas de terceiros;</li>
            <li>Modificar, descompilar ou realizar engenharia reversa do aplicativo;</li>
            <li>Utilizar o app para fins ilícitos ou ofensivos;</li>
            <li>Compartilhar conteúdos do app sem autorização.</li>
          </ul>
          <p className="mt-3">
            O CT Capixaba reserva-se o direito de suspender ou cancelar o acesso de 
            usuários que violarem estes termos.
          </p>
        </section>

        {/* 5. Atividade física e riscos */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            5. Atividade física e riscos
          </h2>
          <p className="mb-3">
            Os treinos são elaborados pelo coach com base nas informações fornecidas 
            pelo aluno. É responsabilidade do aluno:
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Manter acompanhamento médico adequado;</li>
            <li>Respeitar seus limites físicos;</li>
            <li>Comunicar dores, lesões ou desconfortos ao coach;</li>
            <li>Fornecer informações precisas sobre sua condição física.</li>
          </ul>
          <p className="mt-3">
            O CT Capixaba e o aplicativo não se responsabilizam por lesões ou 
            problemas de saúde decorrentes do uso inadequado das orientações 
            ou da não observância das recomendações médicas.
          </p>
        </section>

        {/* 6. Mensalidade e bloqueio */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            6. Mensalidade, bloqueio e cancelamento
          </h2>
          <p>
            O acesso ao aplicativo está vinculado à situação cadastral do aluno junto 
            ao CT Capixaba. Em caso de inadimplência ou cancelamento do vínculo, 
            o acesso pode ser temporariamente bloqueado ou encerrado. Para regularizar 
            o acesso, entre em contato com a recepção ou coordenação do CT.
          </p>
        </section>

        {/* 7. Dados pessoais */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            7. Dados pessoais e privacidade
          </h2>
          <p>
            O tratamento de dados pessoais é detalhado em nossa{" "}
            <Link href="/privacidade" className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
              Política de Privacidade
            </Link>
            . Ao utilizar o aplicativo, você declara ter lido e concordado com os 
            termos de uso e a política de privacidade.
          </p>
        </section>

        {/* 8. Propriedade intelectual */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            8. Propriedade intelectual
          </h2>
          <p>
            A marca CT Capixaba, logotipo, layout do aplicativo, treinos e materiais 
            disponibilizados são de propriedade exclusiva do CT Capixaba e não podem 
            ser copiados, reproduzidos ou utilizados comercialmente sem autorização 
            prévia por escrito.
          </p>
        </section>

        {/* 9. Alterações */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            9. Alterações dos termos
          </h2>
          <p>
            O CT Capixaba pode atualizar estes termos a qualquer momento. Alterações 
            relevantes serão comunicadas por meio do aplicativo ou por e-mail. 
            O uso continuado do aplicativo após as alterações implica aceitação 
            dos novos termos.
          </p>
        </section>

        {/* 10. Contato */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            10. Contato
          </h2>
          <p>
            Para dúvidas sobre estes termos ou sobre o aplicativo, entre em contato 
            pelo e-mail{" "}
            <a
              href="mailto:contato@ctcapixaba.com.br"
              className="text-orange-400 underline underline-offset-2 hover:text-orange-300"
            >
              contato@ctcapixaba.com.br
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
