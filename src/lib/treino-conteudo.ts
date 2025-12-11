/**
 * Helper centralizado para serialização/parsing do campo `conteudo` do Treino.
 * O campo `conteudo` armazena um JSON com os blocos do treino.
 */

export type BlocosTreino = {
  titulo?: string;      // NOVO: título do treino (separado do foco)
  foco?: string;
  mobilidade?: string;
  aquecimento?: string;
  skillForca?: string;
  wod?: string;
  alongamento?: string;
  videoUrl?: string; // opcional, pode vir no JSON legado
};

/**
 * Serializa os blocos do treino para JSON string.
 */
export function serializeConteudo(blocos: BlocosTreino): string {
  return JSON.stringify(blocos ?? {});
}

/**
 * Faz o parse do campo `conteudo` (JSON string) para o objeto tipado.
 * Retorna objeto vazio se `conteudo` for null/undefined ou JSON inválido.
 */
export function parseConteudo(conteudo: string | null | undefined): BlocosTreino {
  if (!conteudo) return {};
  try {
    return JSON.parse(conteudo) as BlocosTreino;
  } catch {
    // fallback: conteúdo legado pode ser texto puro → trata como WOD
    return { wod: conteudo };
  }
}

/**
 * Extrai um título resumido do treino a partir dos blocos.
 * Prioriza: nomeModelo > titulo > foco > primeiro bloco preenchido > "Treino"
 */
export function getTituloFromBlocos(blocos: BlocosTreino, nomeModelo?: string | null): string {
  if (!blocos) return "Treino";

  // 1. Se tiver nomeModelo (treino salvo como modelo), usa ele
  if (nomeModelo && nomeModelo.trim().length > 0) {
    return nomeModelo.trim();
  }

  // 2. Se tiver titulo separado, usa ele
  if (blocos.titulo && blocos.titulo.trim().length > 0) {
    return blocos.titulo.trim();
  }

  // 3. Fallback para foco (comportamento legado)
  if (blocos.foco && blocos.foco.trim().length > 0) {
    return blocos.foco.trim();
  }

  // 4. Fallback para primeiro bloco preenchido
  const ordem: (keyof BlocosTreino)[] = ['wod', 'skillForca', 'aquecimento', 'mobilidade', 'alongamento'];
  for (const key of ordem) {
    const valor = blocos[key];
    if (valor && typeof valor === 'string' && valor.trim().length > 0) {
      // Retorna a primeira linha, limitada a 80 caracteres
      const primeiraLinha = valor.split('\n')[0].trim();
      return primeiraLinha.length > 80 ? primeiraLinha.slice(0, 80) + '...' : primeiraLinha;
    }
  }

  return 'Treino';
}
