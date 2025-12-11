import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade | CT Capixaba",
  description: "Política de privacidade e tratamento de dados do aplicativo CT Capixaba.",
};

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Última atualização: Dezembro de 2025
        </p>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8 text-sm leading-relaxed text-zinc-300">
        {/* 1. Introdução */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            1. Introdução
          </h2>
          <p>
            Esta Política de Privacidade descreve como o CT Capixaba coleta, usa, 
            armazena e protege os dados pessoais de alunos, coaches e demais 
            usuários do aplicativo. Ao utilizar nossos serviços, você concorda 
            com as práticas descritas neste documento.
          </p>
        </section>

        {/* 2. Dados que coletamos */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            2. Dados que coletamos
          </h2>
          
          <h3 className="mb-2 mt-4 font-medium text-zinc-200">Dados de cadastro</h3>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Telefone (quando fornecido)</li>
            <li>Vínculo com o CT Capixaba (aluno, coach, administrador)</li>
          </ul>

          <h3 className="mb-2 mt-4 font-medium text-zinc-200">Dados de uso do aplicativo</h3>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Treinos visualizados e concluídos</li>
            <li>Feedbacks de texto enviados</li>
            <li>Mensagens trocadas com o coach</li>
            <li>PDFs acessados</li>
            <li>Data e horário de acesso</li>
          </ul>

          <h3 className="mb-2 mt-4 font-medium text-zinc-200">Dados técnicos</h3>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Endereço IP (para segurança)</li>
            <li>Tipo de dispositivo e navegador</li>
            <li>Sistema operacional</li>
          </ul>
        </section>

        {/* 3. Dados sensíveis */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            3. Dados sensíveis e de saúde
          </h2>
          <p className="mb-3">
            Reconhecemos que, em feedbacks ou mensagens, podem ser compartilhadas 
            informações sobre condição física, dores, lesões ou outros aspectos 
            relacionados à saúde. Estes são considerados dados sensíveis pela LGPD.
          </p>
          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
            <strong>Orientação:</strong> Evite registrar diagnósticos médicos detalhados 
            nos campos de texto do aplicativo. Informações de saúde sensíveis devem 
            ser tratadas presencialmente com seu coach e profissional de saúde.
          </div>
          <p className="mt-3">
            Todas as informações são tratadas com confidencialidade e segurança reforçada.
          </p>
        </section>

        {/* 4. Finalidades */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            4. Para que usamos seus dados
          </h2>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Entregar treinos personalizados e manter histórico de treinos;</li>
            <li>Permitir comunicação entre aluno e coach;</li>
            <li>Disponibilizar materiais complementares (PDFs);</li>
            <li>Controlar acesso conforme situação cadastral;</li>
            <li>Manter logs para segurança e auditoria;</li>
            <li>Melhorar a experiência do usuário no aplicativo.</li>
          </ul>
        </section>

        {/* 5. Base legal */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            5. Base legal para tratamento
          </h2>
          <p className="mb-3">
            O tratamento dos seus dados pessoais é realizado com base em:
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>
              <strong className="text-zinc-300">Execução de contrato:</strong>{" "}
              necessário para prestação dos serviços contratados junto ao CT Capixaba;
            </li>
            <li>
              <strong className="text-zinc-300">Cumprimento de obrigação legal:</strong>{" "}
              quando exigido por legislação aplicável;
            </li>
            <li>
              <strong className="text-zinc-300">Legítimo interesse:</strong>{" "}
              para melhorar nossos serviços, sempre respeitando seus direitos.
            </li>
          </ul>
        </section>

        {/* 6. Compartilhamento */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            6. Compartilhamento de dados
          </h2>
          
          <h3 className="mb-2 mt-4 font-medium text-zinc-200">Internamente</h3>
          <p className="text-zinc-400">
            Seus dados são acessíveis ao seu coach responsável e, quando necessário, 
            à equipe administrativa do CT Capixaba.
          </p>

          <h3 className="mb-2 mt-4 font-medium text-zinc-200">Terceiros</h3>
          <p className="mb-2 text-zinc-400">
            Podemos compartilhar dados com prestadores de serviço essenciais:
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Provedor de hospedagem e infraestrutura;</li>
            <li>Serviço de envio de e-mails;</li>
            <li>Ferramentas de análise (de forma anonimizada).</li>
          </ul>
          <p className="mt-3 font-medium text-zinc-200">
            Não vendemos dados pessoais para terceiros.
          </p>
        </section>

        {/* 7. Cookies */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            7. Cookies e tecnologias similares
          </h2>
          <p className="mb-3">Utilizamos cookies para:</p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Manter sua sessão de login ativa;</li>
            <li>Lembrar suas preferências;</li>
            <li>Análises de uso (de forma agregada e anônima).</li>
          </ul>
          <p className="mt-3">
            Você pode gerenciar cookies através das configurações do seu navegador, 
            mas isso pode afetar algumas funcionalidades do aplicativo.
          </p>
        </section>

        {/* 8. Segurança */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            8. Segurança dos dados
          </h2>
          <p className="mb-3">
            Adotamos medidas técnicas e organizacionais para proteger seus dados:
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Criptografia em trânsito (HTTPS);</li>
            <li>Senhas armazenadas de forma segura (hash);</li>
            <li>Controles de acesso baseados em função;</li>
            <li>Monitoramento de segurança.</li>
          </ul>
          <p className="mt-3 text-zinc-400">
            Embora nos esforcemos para proteger seus dados, nenhum sistema é 
            completamente seguro. Recomendamos que você também proteja sua conta 
            usando senhas fortes e não compartilhando suas credenciais.
          </p>
        </section>

        {/* 9. Retenção */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            9. Retenção e descarte
          </h2>
          <p>
            Seus dados são mantidos enquanto durar seu vínculo com o CT Capixaba 
            e por até 5 anos após o encerramento, para fins legais e contábeis. 
            Após esse período, os dados são anonimizados ou excluídos de forma segura.
          </p>
        </section>

        {/* 10. Direitos do titular */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            10. Seus direitos (LGPD)
          </h2>
          <p className="mb-3">
            Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
          </p>
          <ul className="list-inside list-disc space-y-1 text-zinc-400">
            <li>Acessar seus dados pessoais;</li>
            <li>Corrigir dados incompletos ou inexatos;</li>
            <li>Solicitar a exclusão de dados (quando aplicável);</li>
            <li>Solicitar portabilidade dos dados;</li>
            <li>Revogar consentimento (quando aplicável);</li>
            <li>Obter informações sobre o compartilhamento dos seus dados.</li>
          </ul>
        </section>

        {/* 11. Contato */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            11. Contato e exercício de direitos
          </h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, 
            entre em contato pelo e-mail{" "}
            <a
              href="mailto:privacidade@ctcapixaba.com.br"
              className="text-orange-400 underline underline-offset-2 hover:text-orange-300"
            >
              privacidade@ctcapixaba.com.br
            </a>{" "}
            ou{" "}
            <a
              href="mailto:contato@ctcapixaba.com.br"
              className="text-orange-400 underline underline-offset-2 hover:text-orange-300"
            >
              contato@ctcapixaba.com.br
            </a>
            .
          </p>
        </section>

        {/* 12. Atualizações */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-100">
            12. Atualizações desta política
          </h2>
          <p>
            Esta política pode ser atualizada periodicamente. Alterações 
            significativas serão comunicadas por meio do aplicativo ou por e-mail. 
            Recomendamos que você revise esta página regularmente.
          </p>
        </section>
      </div>
    </main>
  );
}
