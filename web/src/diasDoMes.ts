/** Ano bissexto no calendário gregoriano. */
function bissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Dia da semana do dia 1º (0 = domingo), pela congruência de Zeller. É conta
 * pura, sem Date, para o fuso não entrar (ver formatarData).
 */
function diaDaSemanaDoPrimeiro(ano: number, mes: number): number {
  const m = mes < 3 ? mes + 12 : mes;
  const a = mes < 3 ? ano - 1 : ano;
  const k = a % 100;
  const j = Math.floor(a / 100);
  const soma = 1 + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) + 5 * j;
  const h = soma % 7;
  // Zeller devolve 0 = sábado; aqui 0 = domingo.
  return (h + 6) % 7;
}

/**
 * Grade do calendário de "AAAA-MM": começa no domingo, com `null` nas casas
 * antes do dia 1º, e cada dia como "AAAA-MM-DD".
 */
export function diasDoMes(mes: string): (string | null)[] {
  const [ano, numero] = mes.split("-").map(Number);
  const total = numero === 2 && bissexto(ano) ? 29 : DIAS_POR_MES[numero - 1];
  const vazios: null[] = Array(diaDaSemanaDoPrimeiro(ano, numero)).fill(null);
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
