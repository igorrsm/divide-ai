import { ErroDeValidacao } from "../erros";
import { intervaloDoMes } from "../extrato/mes";
import { hojeNaCasa } from "./validacao";

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

/** O que a geração (C2) precisa saber de cada despesa recorrente. */
export type ModeloRecorrente = {
  id: number;
  /** Data da despesa-modelo, à meia-noite UTC. */
  data: Date;
  diaDoMes: number;
  ativa: boolean;
  ultimaGeracao: Date | null;
};

/**
 * Quais recorrentes viram lançamento no mês pedido (C2), e em que data.
 *
 * Entra a recorrência ativa cujo modelo é de um mês anterior e que ainda não
 * foi gerada neste mês: `ultimaGeracao` guarda o início do último mês gerado,
 * e gerar de novo o mesmo mês não duplica. O dia é o da recorrência, ou o
 * último do mês nos meses mais curtos. Data futura não é aceita no sistema,
 * então o dia que ainda não chegou fica para depois.
 */
export function lancamentosDoMes(
  mes: string,
  modelos: ModeloRecorrente[],
  agora: Date = new Date(),
): { modeloId: number; data: Date }[] {
  const hoje = hojeNaCasa(agora);
  if (mes > hoje.slice(0, 7)) {
    throw new ErroDeValidacao("Não dá para gerar lançamentos de um mês que ainda não começou.");
  }
  const { inicio, fim } = intervaloDoMes(mes);
  // O dia anterior ao início do mês seguinte é o último dia deste mês.
  const ultimoDia = new Date(fim.getTime() - 86_400_000).getUTCDate();

  return modelos.flatMap((modelo) => {
    if (!modelo.ativa || modelo.data >= inicio) return [];
    if (modelo.ultimaGeracao && modelo.ultimaGeracao >= inicio) return [];
    const data = new Date(
      Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), Math.min(modelo.diaDoMes, ultimoDia)),
    );
    if (data.toISOString().slice(0, 10) > hoje) return [];
    return [{ modeloId: modelo.id, data }];
  });
}

/**
 * Quem já saiu da casa (A4) entre o pagador e os participantes de um modelo
 * recorrente, em ordem de id. Com alguém de fora, a geração (C2) pula o
 * modelo e avisa, em vez de lançar uma parte para quem não mora mais lá.
 */
export function quemSaiuDoModelo(
  pagadorId: number,
  participantesIds: number[],
  saidos: Map<number, string>,
): string[] {
  const ids = [...new Set([pagadorId, ...participantesIds])].sort((a, b) => a - b);
  return ids.flatMap((id) => {
    const nome = saidos.get(id);
    return nome === undefined ? [] : [nome];
  });
}
