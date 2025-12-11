// src/types/treino.ts
export interface TreinoBase {
  id: string;
  titulo?: string | null;
  data: string; // ISO (yyyy-mm-dd)
  alunosResumo: string; // "3 alunos: Fulano, Ciclano…"
  alunoIds: string[];   // para edição
  // blocos visíveis no aluno
  foco?: string | null;
  mobilidade?: string | null;
  aquecimento?: string | null;
  skillForca?: string | null;
  wod?: string | null;
  alongamento?: string | null;
  videoUrl?: string | null;
  modeloId?: string | null;  // se veio da biblioteca
  isConcluido?: boolean;     // se o aluno concluiu o treino
}

export interface TreinoModelo {
  id: string;
  titulo: string;
  foco?: string | null;
  mobilidade?: string | null;
  aquecimento?: string | null;
  skillForca?: string | null;
  wod?: string | null;
  alongamento?: string | null;
  videoUrl?: string | null;
}
