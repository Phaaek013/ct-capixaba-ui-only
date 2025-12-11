// src/components/mensalidade/AvisoMensalidade.tsx
"use client";

import * as React from "react";
import { X, AlertTriangle } from "lucide-react";

type Props = {
  proximoVencimento: Date;
  diasRestantes: number;
  pixChave?: string;
  onClose: () => void;
};

export function AvisoMensalidade({
  proximoVencimento,
  diasRestantes,
  pixChave = "contato@ctcapixaba.com.br",
  onClose,
}: Props) {
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(proximoVencimento));

  const textoAviso =
    diasRestantes === 0
      ? "Sua mensalidade vence hoje!"
      : diasRestantes === 1
      ? "Sua mensalidade vence amanhã!"
      : `Sua mensalidade vence em ${diasRestantes} dias`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[32px] bg-[#18120F] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">
                Atenção!
              </h2>
              <p className="text-sm text-amber-400">{textoAviso}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Vencimento:{" "}
            <span className="font-medium text-zinc-200">{dataFormatada}</span>
          </p>

          <p className="text-sm text-zinc-400">
            Pague via Pix para evitar a suspensão do seu acesso.
          </p>

          {/* Chave Pix */}
          <div className="rounded-2xl bg-[#0d0d0d] border border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">Chave Pix (e-mail)</p>
            <p className="text-sm font-mono text-orange-400 break-all">
              {pixChave}
            </p>
          </div>

          {/* Botão */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-orange-500 py-3 text-sm font-semibold text-black shadow-[0_0_18px_rgba(249,115,22,0.5)] hover:bg-orange-400 transition"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
