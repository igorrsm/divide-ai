/**
 * "2026-09-18", como a API devolve, vira "18/09/2026". Só reorganiza o
 * texto: passar por Date aplicaria o fuso e poderia mostrar o dia anterior.
 */
export function formatarData(dia: string): string {
  const [ano, mes, diaDoMes] = dia.split("-");
  return `${diaDoMes}/${mes}/${ano}`;
}
