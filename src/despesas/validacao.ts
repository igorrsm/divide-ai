import { ErroDeValidacao } from "../erros";

// Aceita "150", "150,5", "150.50". Separador de milhar não é aceito, para não
// haver ambiguidade entre "1.234" (mil duzentos e trinta e quatro) e R$ 1,234.
const PADRAO_VALOR = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/;
const PADRAO_DATA = /^\d{4}-\d{2}-\d{2}$/;

// A casa é no Brasil: é o calendário de São Paulo que decide o que é futuro.
const FUSO_DA_CASA = "America/Sao_Paulo";

/** Data de hoje no fuso da casa, no formato AAAA-MM-DD. */
function hojeNaCasa(agora: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_DA_CASA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

/**
 * Converte um valor em reais para centavos inteiros.
 *
 * A conversão é feita por texto, nunca com ponto flutuante: `19.99 * 100`
 * resulta em 1998.9999999999998, que arredondaria errado.
 */
export function reaisParaCentavos(entrada: string): number {
  const achado = PADRAO_VALOR.exec(entrada.trim());
  if (!achado) {
    throw new ErroDeValidacao("Valor inválido. Use por exemplo 150 ou 150,00.");
  }

  const [, sinal, inteiros, decimais = ""] = achado;
  const centavos = Number(inteiros) * 100 + Number(decimais.padEnd(2, "0"));
  if (sinal === "-" || centavos === 0) {
    throw new ErroDeValidacao("Valor deve ser maior que zero.");
  }
  return centavos;
}

/**
 * Interpreta uma data no formato AAAA-MM-DD e recusa datas futuras.
 *
 * A data é guardada na meia-noite UTC, mas "futuro" é decidido pelo calendário
 * de São Paulo: comparar em UTC aceitaria a data de amanhã durante as três
 * horas finais do dia no Brasil. Lançar uma despesa com a data de hoje vale.
 */
export function interpretaData(entrada: string, agora: Date = new Date()): Date {
  const texto = entrada.trim();
  if (!PADRAO_DATA.test(texto)) {
    throw new ErroDeValidacao("Data inválida. Use o formato AAAA-MM-DD.");
  }

  const data = new Date(`${texto}T00:00:00.000Z`);
  // O JavaScript não rejeita 2026-02-30: ele desliza para 2 de março. A ida e
  // volta pelo ISO é o que pega uma data inexistente no calendário.
  if (Number.isNaN(data.getTime()) || !data.toISOString().startsWith(texto)) {
    throw new ErroDeValidacao("Data inexistente no calendário.");
  }

  // AAAA-MM-DD ordena como texto na mesma ordem da data, então comparar as
  // duas strings basta e não reintroduz fuso na conta.
  if (texto > hojeNaCasa(agora)) {
    throw new ErroDeValidacao("Data futura não é aceita.");
  }
  return data;
}

/** Descrição é o que identifica a despesa na lista, então não pode ser vazia. */
export function interpretaDescricao(entrada: string): string {
  const descricao = entrada.trim();
  if (descricao === "") {
    throw new ErroDeValidacao("Descrição é obrigatória.");
  }
  return descricao;
}

/** Converte o id recebido do cliente, que pode vir como texto do formulário. */
export function interpretaId(entrada: unknown, campo: string): number {
  const id = Number(entrada);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroDeValidacao(`${campo} inválido.`);
  }
  return id;
}
