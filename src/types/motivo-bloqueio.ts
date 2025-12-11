// src/types/motivo-bloqueio.ts

export type MotivoBloqueio = "NENHUM" | "FINANCEIRO" | "MANUAL";

export const MotivoBloqueioLabels: Record<MotivoBloqueio, string> = {
  NENHUM: "Nenhum",
  FINANCEIRO: "Financeiro",
  MANUAL: "Manual",
};
