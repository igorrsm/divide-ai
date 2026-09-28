const NOMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "2026-09" vira "setembro de 2026", sem passar por Date (ver formatarData). */
export function formatarMes(mes: string): string {
  const [ano, numero] = mes.split("-").map(Number);
  return `${NOMES[numero - 1]} de ${ano}`;
}

/** O mês antes (-1) ou depois (+1) de "AAAA-MM", virando o ano se precisar. */
export function mesVizinho(mes: string, passo: -1 | 1): string {
  const [ano, numero] = mes.split("-").map(Number);
  const indice = ano * 12 + (numero - 1) + passo;
  const novoNumero = (indice % 12) + 1;
  return `${Math.floor(indice / 12)}-${String(novoNumero).padStart(2, "0")}`;
}
