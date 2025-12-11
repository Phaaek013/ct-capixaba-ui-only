import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FAQAccordion } from "./FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ – Perguntas Frequentes | CT Capixaba",
  description: "Tire suas dúvidas sobre acesso, treinos e funcionamento do app CT Capixaba.",
};

export default function FAQPage() {
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
          FAQ – Perguntas Frequentes
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Tire suas dúvidas sobre acesso, treinos e funcionamento do app CT Capixaba.
        </p>
      </div>

      {/* Accordion por categoria */}
      <div className="space-y-8">
        {/* Grupo 1 – Acesso e conta */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-400">
            Acesso e conta
          </h2>
          <FAQAccordion
            items={[
              {
                id: "acesso-1",
                question: "Como faço meu primeiro acesso?",
                answer:
                  "Seu acesso é criado pelo seu coach. Ele cadastra seu nome, e-mail e define uma senha temporária. Você entra no app usando esse e-mail e a senha temporária e, no primeiro acesso, será direcionado para a tela de redefinição de senha, onde poderá escolher sua senha definitiva.",
              },
              {
                id: "acesso-2",
                question: "Esqueci minha senha, e agora?",
                answer:
                  "Hoje a recuperação de senha é feita diretamente com o seu coach. Fale com ele e peça uma nova senha temporária. Depois, acesse o app com essa senha temporária e você será levado para a tela de redefinição, onde poderá cadastrar uma nova senha só sua.",
              },
              {
                id: "acesso-3",
                question: "Consigo mudar meu e-mail de acesso?",
                answer:
                  'Sim. Você pode alterar o seu e-mail na área "Meu perfil" dentro do app. Se tiver qualquer problema, fale com seu coach para conferir se o e-mail novo foi salvo corretamente.',
              },
            ]}
          />
        </section>

        {/* Grupo 2 – Treinos */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-400">
            Treinos
          </h2>
          <FAQAccordion
            items={[
              {
                id: "treino-1",
                question: "Onde vejo o treino do dia?",
                answer:
                  'Na tela inicial do app você vê um card com o "Treino de hoje", com um resumo e o botão para abrir o treino completo. Se quiser navegar por outros dias, use o "Calendário de treinos" no menu inferior. Lá você consegue escolher qualquer dia para ver treinos passados e futuros.',
              },
              {
                id: "treino-2",
                question: "Como vejo treinos passados?",
                answer:
                  "Acesse o Calendário de treinos. Você pode navegar pelos dias e ver tanto os treinos que já realizou quanto treinos futuros que o coach já deixou programados.",
              },
              {
                id: "treino-3",
                question: "Consigo editar meu feedback depois de enviar?",
                answer:
                  "Sim! Acesse a área de Feedback e você pode enviar novas mensagens para complementar ou corrigir informações.",
              },
            ]}
          />
        </section>

        {/* Grupo 3 – PDFs e materiais */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-400">
            PDFs e materiais
          </h2>
          <FAQAccordion
            items={[
              {
                id: "pdf-1",
                question: "Onde encontro os PDFs enviados pelo coach?",
                answer:
                  'Na aba "Meus PDFs" você encontra todos os arquivos em PDF que seu coach disponibilizar. Outros tipos de material (vídeos, links etc.) continuam sendo enviados pelos canais que o coach preferir.',
              },
              {
                id: "pdf-2",
                question: "Consigo baixar os PDFs para ver offline?",
                answer:
                  "Sim, você pode baixar os PDFs clicando no botão de download. Eles ficam salvos no seu dispositivo.",
              },
            ]}
          />
        </section>

        {/* Grupo 4 – Mensalidade e acesso */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-400">
            Mensalidade e acesso
          </h2>
          <FAQAccordion
            items={[
              {
                id: "mensalidade-1",
                question: "Meu acesso foi bloqueado, o que aconteceu?",
                answer:
                  "O bloqueio de acesso geralmente está relacionado à situação da mensalidade. Entre em contato com a recepção ou coordenação do CT para mais informações.",
              },
              {
                id: "mensalidade-2",
                question: "Como regularizo meu acesso?",
                answer:
                  "Fale com a recepção ou coordenador do CT Capixaba. Depois que o pagamento for confirmado, seu acesso é liberado pelo coach.",
              },
            ]}
          />
        </section>

        {/* Grupo 5 – Privacidade e dados */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-400">
            Privacidade e dados
          </h2>
          <FAQAccordion
            items={[
              {
                id: "privacidade-1",
                question: "Que dados meus o app armazena?",
                answer:
                  "Armazenamos dados de cadastro (nome, e-mail), histórico de treinos, feedbacks e mensagens trocadas com o coach. Para mais detalhes, consulte nossa Política de Privacidade.",
              },
              {
                id: "privacidade-2",
                question: "Quem pode ver meus feedbacks e mensagens?",
                answer:
                  "Seus feedbacks e mensagens são visíveis apenas para você e seu coach responsável. A equipe administrativa do CT pode ter acesso em casos específicos de suporte.",
              },
            ]}
          />
        </section>
      </div>

      {/* Contato */}
      <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
        <p className="text-sm text-zinc-400">
          Não encontrou o que procurava?{" "}
          <span className="text-zinc-200">Entre em contato com seu coach</span> ou envie um e-mail para{" "}
          <a
            href="mailto:contato@ctcapixaba.com.br"
            className="text-orange-400 underline underline-offset-2 transition hover:text-orange-300"
          >
            contato@ctcapixaba.com.br
          </a>
        </p>
      </div>
    </main>
  );
}
