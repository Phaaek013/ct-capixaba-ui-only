// src/lib/coach-dashboard.ts
import { prisma } from "@/lib/prisma";
import { calcularStatusMensalidade } from "@/lib/aluno-acesso";
import type { MotivoBloqueio } from "@/types/motivo-bloqueio";

export type ResumoAlunosMensalidade = {
  total: number;
  emDia: number;
  aVencer: number;
  vencida: number;
  semConfig: number;
  inativosFinanceiro: number;
  inativosManuais: number;
};

/**
 * Retorna um resumo agregado dos alunos por status de mensalidade
 * Usado no dashboard do coach
 */
export async function getResumoAlunosMensalidade(): Promise<ResumoAlunosMensalidade> {
  const alunos = await prisma.usuario.findMany({
    where: { tipo: "Aluno" },
    select: {
      id: true,
      ativo: true,
      proximoVencimentoEm: true,
      motivoBloqueio: true,
    },
  });

  let emDia = 0;
  let aVencer = 0;
  let vencida = 0;
  let semConfig = 0;
  let inativosFinanceiro = 0;
  let inativosManuais = 0;

  for (const aluno of alunos) {
    const motivoBloqueio = aluno.motivoBloqueio as MotivoBloqueio;

    // Alunos inativos contam separadamente
    if (!aluno.ativo) {
      if (motivoBloqueio === "FINANCEIRO") {
        inativosFinanceiro++;
      } else if (motivoBloqueio === "MANUAL") {
        inativosManuais++;
      }
      continue; // não entra nas contagens "ativos"
    }

    // Alunos ativos: classificar por status da mensalidade
    const status = calcularStatusMensalidade(aluno.proximoVencimentoEm);

    switch (status) {
      case "EM_DIA":
        emDia++;
        break;
      case "A_VENCER":
        aVencer++;
        break;
      case "VENCIDA":
        vencida++;
        break;
      case "SEM_CONFIG":
      default:
        semConfig++;
        break;
    }
  }

  return {
    total: alunos.length,
    emDia,
    aVencer,
    vencida,
    semConfig,
    inativosFinanceiro,
    inativosManuais,
  };
}
