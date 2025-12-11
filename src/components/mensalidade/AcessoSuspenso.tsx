// src/components/mensalidade/AcessoSuspenso.tsx
"use client";

import { signOut } from "next-auth/react";
import { XCircle } from "lucide-react";

type Props = {
  proximoVencimento?: Date;
  pixChave?: string;
};

export function AcessoSuspenso({
  proximoVencimento,
  pixChave = "contato@ctcapixaba.com.br",
}: Props) {
  const dataFormatada = proximoVencimento
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(proximoVencimento))
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[32px] bg-[#18120F] p-8 shadow-2xl text-center">
        {/* Ícone */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-zinc-50 mb-2">
          Acesso Suspenso
        </h1>

        <p className="text-sm text-zinc-400 mb-6">
          Seu acesso está suspenso devido a mensalidade vencida.
          {dataFormatada && (
            <>
              <br />
              <span className="text-red-400">
                Vencimento: {dataFormatada}
              </span>
            </>
          )}
        </p>

        {/* Instruções de pagamento */}
        <div className="space-y-4 mb-8">
          <p className="text-sm text-zinc-300">
            Para regularizar seu acesso, efetue o pagamento via Pix:
          </p>

          {/* Chave Pix */}
          <div className="rounded-2xl bg-[#0d0d0d] border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Chave Pix (e-mail)</p>
            <p className="text-sm font-mono text-orange-400 break-all">
              {pixChave}
            </p>
          </div>

          <p className="text-xs text-zinc-500">
            Após o pagamento, seu coach liberará o acesso novamente.
          </p>
        </div>

        {/* Botão de logout */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-full border border-zinc-600 bg-transparent py-3 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
