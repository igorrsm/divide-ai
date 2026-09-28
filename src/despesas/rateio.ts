import { ErroDeValidacao } from "../erros";

export type ParticipacaoRateada = {
  moradorId: number;
  valorCentavos: number;
  /** Só na divisão por percentual (B5): 33,33% é 3333. */
  percentualCentesimos?: number;
};

/**
 * Divide o valor igualmente entre os participantes, em centavos inteiros.
 *
 * A divisão inteira quase sempre deixa resto: R$ 100,00 entre três dá
 * 3333 × 3 = 9999 e sobra 1 centavo. A sobra vai inteira para quem pagou,
 * porque foi ele que desembolsou. Se quem pagou não participa da despesa, vai
 * inteira para o participante de menor id — critério determinístico, que não
 * depende da ordem da lista recebida. A sobra nunca é espalhada entre vários, e
 * nunca se cria participação para quem não participa.
 *
 * A soma das participações é sempre exatamente o valor da despesa. O banco não
 * garante essa invariante, então ela é garantida aqui.
 */
export function ratearIgualmente(
  valorCentavos: number,
  participantesIds: number[],
  pagadorId: number,
): ParticipacaoRateada[] {
  if (!Number.isInteger(valorCentavos) || valorCentavos <= 0) {
    throw new ErroDeValidacao("Valor da despesa deve ser um inteiro de centavos maior que zero.");
  }

  // Id repetido não vira participação duplicada: a chave é despesaId + moradorId.
  const ids = [...new Set(participantesIds)];
  if (ids.length === 0) {
    throw new ErroDeValidacao("A despesa precisa de ao menos um participante.");
  }

  const base = Math.floor(valorCentavos / ids.length);
  const sobra = valorCentavos - base * ids.length;
  const donoDaSobra = ids.includes(pagadorId) ? pagadorId : Math.min(...ids);

  return ids.map((moradorId) => ({
    moradorId,
    valorCentavos: moradorId === donoDaSobra ? base + sobra : base,
  }));
}
