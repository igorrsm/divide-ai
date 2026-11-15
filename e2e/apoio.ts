// Funções comuns aos testes E2E.

/**
 * O Intl põe um espaço não separável depois do "R$": o texto esperado vira
 * uma expressão em que cada espaço aceita qualquer espaço.
 */
export function naTela(texto: string): RegExp {
  const escapado = texto.replace(/[$()+.]/g, "\\$&");
  return new RegExp(escapado.replace(/ /g, "\\s"));
}
