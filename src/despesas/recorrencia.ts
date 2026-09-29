import { ErroDeValidacao } from "../erros";

/**
 * "Repete todo mês" (C1). Aceita o booleano do formulário ou o texto dele.
 * Ausente devolve undefined: ao lançar, a despesa é avulsa; ao editar, a
 * recorrência fica como estava.
 */
export function interpretaRecorrente(entrada: unknown): boolean | undefined {
  if (entrada === undefined || entrada === null || entrada === "") return undefined;
  if (entrada === true || entrada === "true") return true;
  if (entrada === false || entrada === "false") return false;
  throw new ErroDeValidacao("Recorrente precisa ser verdadeiro ou falso.");
}

/** Dia do mês em que a despesa se repete: o dia da data dela (meia-noite UTC). */
export function diaDoMesDa(data: Date): number {
  return data.getUTCDate();
}
