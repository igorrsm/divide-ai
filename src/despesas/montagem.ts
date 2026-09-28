import { ErroDeValidacao } from "../erros";
import { ratearIgualmente, type ParticipacaoRateada } from "./rateio";
import {
  interpretaData,
  interpretaDescricao,
  interpretaId,
  interpretaParticipantes,
  reaisParaCentavos,
} from "./validacao";

export type EntradaDespesa = {
  descricao?: unknown;
  valor?: unknown;
  data?: unknown;
  pagadorId?: unknown;
  /** Quem participa do rateio (B4). Ausente significa todos os moradores. */
  participantesIds?: unknown;
};

export type DespesaMontada = {
  descricao: string;
  valorCentavos: number;
  data: Date;
  pagadorId: number;
  participacoes: ParticipacaoRateada[];
};

/**
 * Aceita texto e número. Número é convertido pela representação curta do
 * JavaScript, então 19.99 vira "19.99"; um float sujo como 0.30000000000000004
 * não casa com o padrão de valor e é recusado em vez de arredondado em
 * silêncio.
 */
function comoTexto(valor: unknown, campo: string): string {
  if (typeof valor === "string") return valor;
  if (typeof valor === "number" && Number.isFinite(valor)) return String(valor);
  throw new ErroDeValidacao(`${campo} é obrigatório.`);
}

/**
 * Valida a entrada e calcula o rateio, sem tocar no banco. É a mesma regra
 * para lançar (B1/B2/B4) e para editar (B6): quem pagou precisa ser morador da
 * casa, e as participações somam exatamente o valor.
 */
export function montaDespesa(
  entrada: EntradaDespesa,
  idsDaCasa: number[],
  hoje: Date = new Date(),
): DespesaMontada {
  const descricao = interpretaDescricao(comoTexto(entrada.descricao, "Descrição"));
  const valorCentavos = reaisParaCentavos(comoTexto(entrada.valor, "Valor"));
  const data = interpretaData(comoTexto(entrada.data, "Data"), hoje);
  const pagadorId = interpretaId(entrada.pagadorId, "Quem pagou");
  // Precisa ser morador desta república, não de outra.
  if (!idsDaCasa.includes(pagadorId)) {
    throw new ErroDeValidacao("Quem pagou precisa ser um morador desta república.");
  }
  const participantesIds = interpretaParticipantes(entrada.participantesIds, idsDaCasa);
  const participacoes = ratearIgualmente(valorCentavos, participantesIds, pagadorId);
  return { descricao, valorCentavos, data, pagadorId, participacoes };
}
