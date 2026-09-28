/**
 * Grade do calendário de "AAAA-MM": começa no domingo, com `null` nas casas
 * antes do dia 1º, e cada dia como "AAAA-MM-DD".
 */
export function diasDoMes(mes: string): (string | null)[] {
  const [ano, numero] = mes.split("-").map(Number);
  // Date.UTC não depende do fuso de quem está usando: o dia 0 do mês seguinte
  // é o último dia deste, e getUTCDay dá o dia da semana do dia 1º.
  const total = new Date(Date.UTC(ano, numero, 0)).getUTCDate();
  const primeiro = new Date(Date.UTC(ano, numero - 1, 1)).getUTCDay();
  const vazios: null[] = Array(primeiro).fill(null);
  const dias = Array.from({ length: total }, (_, i) => `${mes}-${String(i + 1).padStart(2, "0")}`);
  return [...vazios, ...dias];
}

/** Hoje no calendário da casa, em "AAAA-MM-DD". */
export function hojeNaCasa(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
