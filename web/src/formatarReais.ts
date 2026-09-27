const FORMATO = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Converte centavos inteiros, como vêm da API, para texto em reais:
 * 123456 vira "R$ 1.234,56". Dinheiro só vira texto na tela; nas contas
 * continua em centavos.
 */
export function formatarReais(centavos: number): string {
  return FORMATO.format(centavos / 100);
}
