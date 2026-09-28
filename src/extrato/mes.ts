import { hojeNaCasa } from "../despesas/validacao";
import { ErroDeValidacao } from "../erros";

const PADRAO_MES = /^(\d{4})-(\d{2})$/;

/**
 * Mês do extrato (E1) no formato AAAA-MM. Sem o parâmetro, vale o mês de
 * hoje no calendário da casa, pelo mesmo motivo de `interpretaData`: em UTC,
 * as três horas finais do último dia do mês já seriam o mês seguinte.
 */
export function interpretaMes(bruto: unknown, agora: Date = new Date()): string {
  if (bruto === undefined || bruto === "") return hojeNaCasa(agora).slice(0, 7);

  const achado = typeof bruto === "string" ? PADRAO_MES.exec(bruto.trim()) : null;
  const mes = achado ? Number(achado[2]) : 0;
  if (!achado || mes < 1 || mes > 12) {
    throw new ErroDeValidacao("Mês inválido. Use o formato AAAA-MM.");
  }
  return `${achado[1]}-${achado[2]}`;
}

/**
 * Início do mês e início do mês seguinte, para buscar com `gte` e `lt`. As
 * despesas são gravadas à meia-noite UTC do dia, então o corte também é UTC.
 */
export function intervaloDoMes(mes: string): { inicio: Date; fim: Date } {
  const [ano, numero] = mes.split("-").map(Number);
  return {
    inicio: new Date(Date.UTC(ano, numero - 1, 1)),
    // Date.UTC com mês 12 (dezembro + 1) já vira janeiro do ano seguinte.
    fim: new Date(Date.UTC(ano, numero, 1)),
  };
}
