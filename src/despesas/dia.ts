/**
 * O dia (AAAA-MM-DD) de uma data de despesa, sem passar pelo fuso.
 *
 * A data é gravada à meia-noite UTC do dia escolhido (ver interpretaData),
 * então o dia certo é o prefixo do ISO. Converter para o fuso local mostraria
 * o dia anterior no Brasil. Se a forma de gravar mudar, os testes em
 * dia.test.ts acusam.
 */
export function diaDa(data: Date): string {
  return data.toISOString().slice(0, 10);
}
