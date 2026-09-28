import { ErroDeValidacao } from "../erros";
import type { ParticipacaoRateada } from "./rateio";

/** 100% em centésimos de ponto: 33,33% é 3333. */
const CEM_POR_CENTO = 10000;

// Até duas casas decimais, com vírgula ou ponto: "50", "33,3", "33.33".
const PADRAO_PERCENTUAL = /^(\d+)(?:[.,](\d{1,2}))?$/;

/** "R$ 1.234,56", para as mensagens de erro. O front tem o próprio formatarReais. */
function reais(centavos: number): string {
  const inteiros = String(Math.floor(centavos / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${inteiros},${String(centavos % 100).padStart(2, "0")}`;
}

/** 9000 vira "90" e 3333 vira "33,33", sem zeros sobrando. */
function percentual(centesimos: number): string {
  const decimais = String(centesimos % 100).padStart(2, "0").replace(/0+$/, "");
  return `${Math.floor(centesimos / 100)}${decimais ? `,${decimais}` : ""}`;
}

/**
 * Percentual em texto para centésimos de ponto inteiros, sem ponto flutuante,
 * pelo mesmo motivo de reaisParaCentavos: "33,33" vira 3333.
 */
export function percentualParaCentesimos(entrada: string): number {
  const achado = PADRAO_PERCENTUAL.exec(entrada.trim());
  if (!achado) {
    throw new ErroDeValidacao("Percentual inválido. Use por exemplo 50 ou 33,33.");
  }
  const [, inteiros, decimais = ""] = achado;
  const centesimos = Number(inteiros) * 100 + Number(decimais.padEnd(2, "0"));
  if (centesimos === 0) throw new ErroDeValidacao("Percentual deve ser maior que zero.");
  return centesimos;
}

/**
 * Divisão por valores informados (B5). Cada parte já vem em centavos; a soma
 * precisa fechar exatamente com o total, senão a despesa ficaria com rateio
 * maior ou menor do que foi gasto.
 */
export function ratearPorValores(
  valorCentavos: number,
  partes: { moradorId: number; centavos: number }[],
): ParticipacaoRateada[] {
  const soma = partes.reduce((total, parte) => total + parte.centavos, 0);
  if (soma !== valorCentavos) {
    const total = reais(valorCentavos);
    throw new ErroDeValidacao(
      `A soma dos valores (${reais(soma)}) é diferente do total da despesa (${total}).`,
    );
  }
  return partes.map(({ moradorId, centavos }) => ({ moradorId, valorCentavos: centavos }));
}

/**
 * Divisão por percentuais (B5). A soma precisa dar exatamente 100%. Cada parte
 * é arredondada para baixo e a sobra de centavos segue a regra da B2: vai
 * inteira para quem pagou ou, se ele não participa, para o menor id. O
 * percentual fica guardado para a edição (B6) abrir com os números originais.
 */
export function ratearPorPercentuais(
  valorCentavos: number,
  partes: { moradorId: number; centesimos: number }[],
  pagadorId: number,
): ParticipacaoRateada[] {
  const soma = partes.reduce((total, parte) => total + parte.centesimos, 0);
  if (soma !== CEM_POR_CENTO) {
    throw new ErroDeValidacao(
      `A soma dos percentuais é ${percentual(soma)}%, e precisa ser 100%.`,
    );
  }

  const rateadas = partes.map(({ moradorId, centesimos }) => ({
    moradorId,
    valorCentavos: Math.floor((valorCentavos * centesimos) / CEM_POR_CENTO),
    percentualCentesimos: centesimos,
  }));
  const sobra = valorCentavos - rateadas.reduce((total, p) => total + p.valorCentavos, 0);
  const ids = rateadas.map((p) => p.moradorId);
  const donoDaSobra = ids.includes(pagadorId) ? pagadorId : Math.min(...ids);
  return rateadas.map((p) =>
    p.moradorId === donoDaSobra ? { ...p, valorCentavos: p.valorCentavos + sobra } : p,
  );
}
