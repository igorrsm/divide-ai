/** "2026-09-05" vira 5, sem Date; texto fora do formato vira null. */
export function diaDoTexto(data: string): number | null {
  const achado = /^\d{4}-\d{2}-(\d{2})$/.exec(data);
  return achado ? Number(achado[1]) : null;
}

/**
 * A frase da recorrência (C1), com o dia em dois algarismos ("dia 05",
 * pedido da Thalita). Depois do dia 28, lembra dos meses curtos.
 */
export function textoRecorrencia(dia: number): string {
  const texto = `Todo mês, no dia ${String(dia).padStart(2, "0")}`;
  return dia > 28 ? `${texto} (ou no último dia, nos meses mais curtos)` : texto;
}
