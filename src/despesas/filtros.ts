import { ErroDeValidacao } from "../erros";
import { interpretaId } from "./validacao";

const PADRAO_DIA = /^\d{4}-\d{2}-\d{2}$/;

/** Filtros da lista de despesas (E2), já prontos para a consulta. */
export type FiltrosDespesas = {
  /** Meia-noite UTC do dia "De", inclusive. */
  desde?: Date;
  /** Meia-noite UTC do dia seguinte ao "Até": a busca usa `lt`. */
  antesDe?: Date;
  /** Despesas que algum desses moradores pagou ou das quais participa. */
  moradorIds?: number[];
};

/** Parâmetro ausente ou vazio vale como "sem filtro"; repetido é recusado. */
function texto(bruto: unknown, campo: string): string | undefined {
  if (bruto === undefined || bruto === "") return undefined;
  if (typeof bruto !== "string") throw new ErroDeValidacao(`${campo} inválido.`);
  return bruto.trim() || undefined;
}

/**
 * Dia AAAA-MM-DD à meia-noite UTC, como as despesas são gravadas. Diferente
 * de `interpretaData`, aceita o futuro: filtrar "até o fim do mês" é normal.
 */
function dia(bruto: string, campo: string): Date {
  const data = new Date(`${bruto}T00:00:00.000Z`);
  // A ida e volta pelo ISO pega dia inexistente, como 2026-02-30.
  const valida = !Number.isNaN(data.getTime()) && data.toISOString().startsWith(bruto);
  if (!PADRAO_DIA.test(bruto) || !valida) {
    throw new ErroDeValidacao(`${campo} inválida. Use o formato AAAA-MM-DD.`);
  }
  return data;
}

/**
 * Interpreta `?de=AAAA-MM-DD&ate=AAAA-MM-DD&moradores=1,2` (E2). Cada filtro é
 * opcional. Com vários moradores, vale a despesa de qualquer um deles
 * (decisão da Thalita). Morador de outra casa é recusado em vez de devolver
 * lista vazia, como em `interpretaParticipantes`.
 */
export function interpretaFiltros(
  consulta: { de?: unknown; ate?: unknown; moradores?: unknown },
  idsDaCasa: number[],
): FiltrosDespesas {
  const filtros: FiltrosDespesas = {};
  const de = texto(consulta.de, "Data inicial");
  const ate = texto(consulta.ate, "Data final");
  const moradores = texto(consulta.moradores, "Morador");

  if (de) filtros.desde = dia(de, "Data inicial");
  if (ate) {
    const fim = dia(ate, "Data final");
    filtros.antesDe = new Date(fim.getTime() + 24 * 60 * 60 * 1000);
  }
  if (filtros.desde && filtros.antesDe && filtros.desde >= filtros.antesDe) {
    throw new ErroDeValidacao("A data inicial não pode ser depois da data final.");
  }
  if (moradores) {
    // Set: id repetido na URL não vira filtro duplicado.
    const ids = new Set(moradores.split(",").map((bruto) => interpretaId(bruto.trim(), "Morador")));
    for (const id of ids) {
      if (!idsDaCasa.includes(id)) {
        throw new ErroDeValidacao(`O morador ${id} não é desta república.`);
      }
    }
    filtros.moradorIds = [...ids];
  }
  return filtros;
}
