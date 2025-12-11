// src/lib/mensalidade-aluno.ts
import { prisma } from "@/lib/prisma";

export type StatusMensalidade = "SEM_CONFIG" | "EM_DIA" | "A_VENCER" | "VENCIDA";

/**
 * Calcula o status da mensalidade baseado na data de vencimento
 */
export function calcularStatusMensalidade(
  proximoVencimentoEm: Date | null | undefined,
  hoje: Date = new Date()
): StatusMensalidade {
  if (!proximoVencimentoEm) {
    return "SEM_CONFIG";
  }

  const inicioHoje = new Date(hoje);
  inicioHoje.setHours(0, 0, 0, 0);

  const inicioVencimento = new Date(proximoVencimentoEm);
  inicioVencimento.setHours(0, 0, 0, 0);

  const diffMs = inicioVencimento.getTime() - inicioHoje.getTime();
  const diffDias = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDias < 0) return "VENCIDA";
  if (diffDias <= 3) return "A_VENCER";
  return "EM_DIA";
}

export type InfoMensalidadeAluno = {
  ativo: boolean;
  status: StatusMensalidade;
  proximoVencimentoEm: Date | null;
};

/**
 * Busca o status da mensalidade de um aluno no banco
 * Essa é a fonte única de verdade lado aluno
 */
export async function getStatusMensalidadeDoAluno(
  usuarioId: number
): Promise<InfoMensalidadeAluno> {
  const aluno = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { ativo: true, proximoVencimentoEm: true },
  });

  if (!aluno) {
    return { ativo: false, status: "SEM_CONFIG", proximoVencimentoEm: null };
  }

  const status = calcularStatusMensalidade(aluno.proximoVencimentoEm);

  return {
    ativo: aluno.ativo,
    status,
    proximoVencimentoEm: aluno.proximoVencimentoEm,
  };
}
