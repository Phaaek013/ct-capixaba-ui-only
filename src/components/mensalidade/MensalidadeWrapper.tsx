// src/components/mensalidade/MensalidadeWrapper.tsx
"use client";

import * as React from "react";
import { AvisoMensalidade } from "./AvisoMensalidade";
import { AcessoSuspenso } from "./AcessoSuspenso";
import type { StatusMensalidade } from "@/lib/aluno-acesso";

type Props = {
  children: React.ReactNode;
  status: StatusMensalidade;
  proximoVencimento?: string | null;
  diasRestantes?: number;
  pixChave?: string;
};

export function MensalidadeWrapper({
  children,
  status,
  proximoVencimento,
  diasRestantes = 0,
  pixChave,
}: Props) {
  const [avisoFechado, setAvisoFechado] = React.useState(false);

  // Se bloqueado, mostra tela de acesso suspenso
  if (status === "BLOQUEADO") {
    return (
      <AcessoSuspenso
        proximoVencimento={proximoVencimento ? new Date(proximoVencimento) : undefined}
        pixChave={pixChave}
      />
    );
  }

  return (
    <>
      {/* Modal de aviso (3 dias antes) */}
      {status === "AVISO" && !avisoFechado && proximoVencimento && (
        <AvisoMensalidade
          proximoVencimento={new Date(proximoVencimento)}
          diasRestantes={diasRestantes}
          pixChave={pixChave}
          onClose={() => setAvisoFechado(true)}
        />
      )}

      {/* Conteúdo normal */}
      {children}
    </>
  );
}
