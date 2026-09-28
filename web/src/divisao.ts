import { formatarReais } from "./formatarReais";

export type TipoDivisao = "IGUAL" | "VALOR" | "PERCENTUAL";

/** Título do rateio, no formulário e no detalhe. */
export const TITULO_DIVISAO = {
  IGUAL: "Dividida por igual",
  VALOR: "Dividida por valores",
  PERCENTUAL: "Dividida por percentuais",
} as const;

// Mesmos formatos que a API aceita (reaisParaCentavos e percentualParaCentesimos).
const PADRAO = /^(\d+)(?:[.,](\d{1,2}))?$/;

/** "150,5" vira 15050 e "33,33" vira 3333; texto inválido ou zero vira null. */
export function textoParaInteiro(texto: string): number | null {
  const achado = PADRAO.exec(texto.trim());
  if (!achado) return null;
  const numero = Number(achado[1]) * 100 + Number((achado[2] ?? "").padEnd(2, "0"));
  return numero > 0 ? numero : null;
}

/** 3333 vira "33,33" e 5000 vira "50", para o campo e para o detalhe. */
export function formatarPercentual(centesimos: number): string {
  const decimais = String(centesimos % 100).padStart(2, "0").replace(/0+$/, "");
  return `${Math.floor(centesimos / 100)}${decimais ? `,${decimais}` : ""}`;
}

/**
 * Conta ao vivo da divisão por valores ou percentuais (B5): diz quanto falta
 * ou passou e se já dá para salvar. A API confere de novo; aqui é só para a
 * pessoa ver antes de enviar.
 */
export function conferePartes(
  tipo: "VALOR" | "PERCENTUAL",
  totalTexto: string,
  partes: string[],
): { fecha: boolean; mensagem: string } {
  const numeros = partes.map(textoParaInteiro);
  const alvo = tipo === "VALOR" ? textoParaInteiro(totalTexto) : 10000;
  if (alvo === null) return { fecha: false, mensagem: "Informe o valor da despesa primeiro." };

  const soma = numeros.reduce<number>((total, n) => total + (n ?? 0), 0);
  const escrever = (n: number) =>
    tipo === "VALOR" ? formatarReais(n) : `${formatarPercentual(n)}%`;
  if (soma < alvo) return { fecha: false, mensagem: `Faltam ${escrever(alvo - soma)}.` };
  if (soma > alvo) return { fecha: false, mensagem: `Passou ${escrever(soma - alvo)} do total.` };
  if (numeros.includes(null)) return { fecha: false, mensagem: "Preencha a parte de cada um." };
  return {
    fecha: true,
    mensagem: tipo === "VALOR" ? "A soma fecha com o total." : "A soma dá 100%.",
  };
}
