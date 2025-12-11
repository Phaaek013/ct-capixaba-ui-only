// src/lib/aluno-acesso.ts
import { prisma } from "@/lib/prisma";

export type StatusMensalidade = "OK" | "AVISO" | "BLOQUEADO" | "SEM_CONFIG";

// Tipo para uso no dashboard (sem considerar ativo/inativo)
export type StatusMensalidadePuro = "EM_DIA" | "A_VENCER" | "VENCIDA" | "SEM_CONFIG";

export interface AlunoAcessoInfo {
  status: StatusMensalidade;
  proximoVencimento?: Date;
  diasRestantes?: number;
}

/**
 * Calcula o status da mensalidade apenas pela data de vencimento
 * Útil para dashboard e contagens
 */
export function calcularStatusMensalidade(
  proximoVencimentoEm: Date | null | undefined,
  hoje: Date = new Date()
): StatusMensalidadePuro {
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

/**
 * Verifica se a data está dentro da janela de aviso (3 dias corridos antes do vencimento)
 */
export function isWithinWarningWindow(
  proximoVencimento: Date,
  hoje: Date = new Date()
): boolean {
  const msPorDia = 24 * 60 * 60 * 1000;
  const hojeZerado = new Date(hoje);
  hojeZerado.setHours(0, 0, 0, 0);

  const vencimentoZerado = new Date(proximoVencimento);
  vencimentoZerado.setHours(0, 0, 0, 0);

  const diffDias = Math.floor(
    (vencimentoZerado.getTime() - hojeZerado.getTime()) / msPorDia
  );

  // entre 0 e 3 dias corridos antes de vencer (inclusive o dia do vencimento)
  return diffDias >= 0 && diffDias <= 3;
}

/**
 * Calcula quantos dias faltam para o vencimento
 */
export function calcularDiasRestantes(
  proximoVencimento: Date,
  hoje: Date = new Date()
): number {
  const msPorDia = 24 * 60 * 60 * 1000;
  const hojeZerado = new Date(hoje);
  hojeZerado.setHours(0, 0, 0, 0);

  const vencimentoZerado = new Date(proximoVencimento);
  vencimentoZerado.setHours(0, 0, 0, 0);

  return Math.floor(
    (vencimentoZerado.getTime() - hojeZerado.getTime()) / msPorDia
  );
}

/**
 * Calcula o próximo vencimento baseado no dia do mês
 */
export function calcularProximoVencimento(
  diaVencimento: number,
  referencia: Date = new Date()
): Date {
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth();

  // Tenta criar a data com o dia informado neste mês
  let dataEsteMes = new Date(ano, mes, diaVencimento);

  // Se o dia não existe neste mês (ex: 31 em fevereiro), ajusta para o último dia
  if (dataEsteMes.getMonth() !== mes) {
    dataEsteMes = new Date(ano, mes + 1, 0); // último dia do mês atual
  }

  const hojeZerado = new Date(referencia);
  hojeZerado.setHours(0, 0, 0, 0);

  // se ainda não passou nesse mês, usamos este mês; senão, mês seguinte
  if (hojeZerado <= dataEsteMes) {
    return dataEsteMes;
  }

  // Próximo mês
  let proximoMes = new Date(ano, mes + 1, diaVencimento);

  // Ajusta se o dia não existe no próximo mês
  if (proximoMes.getDate() !== diaVencimento) {
    proximoMes = new Date(ano, mes + 2, 0); // último dia do próximo mês
  }

  return proximoMes;
}

/**
 * Busca informações de acesso do aluno baseado no status da mensalidade
 */
export async function getAlunoAcessoInfo(
  usuarioId: number
): Promise<AlunoAcessoInfo> {
  const aluno = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      diaVencimentoMensalidade: true,
      proximoVencimentoEm: true,
      ativo: true,
    },
  });

  // Aluno não encontrado ou inativo
  if (!aluno || !aluno.ativo) {
    return { status: "BLOQUEADO" };
  }

  // Coach não configurou vencimento ainda
  if (!aluno.proximoVencimentoEm) {
    return { status: "SEM_CONFIG" };
  }

  const hoje = new Date();
  const hojeZerado = new Date(hoje);
  hojeZerado.setHours(0, 0, 0, 0);

  const proximo = new Date(aluno.proximoVencimentoEm);
  const proximoZerado = new Date(proximo);
  proximoZerado.setHours(0, 0, 0, 0);

  const diasRestantes = calcularDiasRestantes(proximo, hoje);

  // Vencido - bloquear acesso
  if (hojeZerado > proximoZerado) {
    return {
      status: "BLOQUEADO",
      proximoVencimento: proximo,
      diasRestantes,
    };
  }

  // Dentro da janela de aviso (3 dias antes)
  if (isWithinWarningWindow(proximo, hoje)) {
    return {
      status: "AVISO",
      proximoVencimento: proximo,
      diasRestantes,
    };
  }

  // Tudo OK
  return {
    status: "OK",
    proximoVencimento: proximo,
    diasRestantes,
  };
}
