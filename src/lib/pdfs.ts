export function slugifyPdfTitle(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 60) || "documento"
  );
}

export function resumirDestinatarios(nomes: Array<string | null>): string {
  const validos = nomes.filter(Boolean) as string[];
  const quantidade = validos.length;

  if (quantidade === 0) {
    return "Nenhum destinatario";
  }

  if (quantidade === 1) {
    return validos[0];
  }

  if (quantidade === 2) {
    return `${validos[0]}, ${validos[1]}`;
  }

  return `${validos[0]}, ${validos[1]}...`;
}
