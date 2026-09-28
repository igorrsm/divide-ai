import { ErroDeValidacao } from "../erros";
import { percentualParaCentesimos, ratearPorPercentuais, ratearPorValores } from "./divisao";
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
  /** "IGUAL" (padrão), "VALOR" ou "PERCENTUAL" (B5). */
  tipoDivisao?: unknown;
  /** Na divisão por valor ou percentual: [{ moradorId, valor: "150,00" ou "33,33" }]. */
  partes?: unknown;
};

export type TipoDivisao = "IGUAL" | "VALOR" | "PERCENTUAL";

export type DespesaMontada = {
  descricao: string;
  valorCentavos: number;
  data: Date;
  pagadorId: number;
  tipoDivisao: TipoDivisao;
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

/** Sem o campo, vale a divisão igual da B2, como antes da B5. */
function interpretaTipoDivisao(bruto: unknown): TipoDivisao {
  if (bruto === undefined || bruto === null) return "IGUAL";
  if (bruto === "IGUAL" || bruto === "VALOR" || bruto === "PERCENTUAL") return bruto;
  throw new ErroDeValidacao("Tipo de divisão inválido. Use IGUAL, VALOR ou PERCENTUAL.");
}

/**
 * O texto informado para cada participante (B5). Todo participante precisa de
 * uma parte, e só participante pode ter parte: quem foi desmarcado não entra.
 */
function interpretaPartes(bruto: unknown, participantesIds: number[]): Map<number, string> {
  if (!Array.isArray(bruto)) {
    throw new ErroDeValidacao("Informe a parte de cada participante.");
  }
  const partes = new Map<number, string>();
  for (const item of bruto) {
    const { moradorId, valor } = (item ?? {}) as { moradorId?: unknown; valor?: unknown };
    const id = interpretaId(moradorId, "Participante");
    if (!participantesIds.includes(id)) {
      throw new ErroDeValidacao(`O morador ${id} não está marcado para participar.`);
    }
    partes.set(id, comoTexto(valor, "A parte de cada participante"));
  }
  const faltando = participantesIds.find((id) => !partes.has(id));
  if (faltando !== undefined) {
    throw new ErroDeValidacao(`Falta a parte do morador ${faltando}.`);
  }
  return partes;
}

/**
 * Valida a entrada e calcula o rateio, sem tocar no banco. É a mesma regra
 * para lançar (B1/B2/B4/B5) e para editar (B6): quem pagou precisa ser morador da
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
  const pagadorId = interpretaId(entrada.pagadorId, "Id de quem pagou");
  // Precisa ser morador desta república, não de outra.
  if (!idsDaCasa.includes(pagadorId)) {
    throw new ErroDeValidacao("Quem pagou precisa ser um morador desta república.");
  }
  const participantesIds = interpretaParticipantes(entrada.participantesIds, idsDaCasa);
  const tipoDivisao = interpretaTipoDivisao(entrada.tipoDivisao);

  let participacoes: ParticipacaoRateada[];
  if (tipoDivisao === "IGUAL") {
    participacoes = ratearIgualmente(valorCentavos, participantesIds, pagadorId);
  } else {
    const partes = [...interpretaPartes(entrada.partes, participantesIds)];
    participacoes =
      tipoDivisao === "VALOR"
        ? ratearPorValores(
            valorCentavos,
            partes.map(([moradorId, texto]) => ({ moradorId, centavos: reaisParaCentavos(texto) })),
          )
        : ratearPorPercentuais(
            valorCentavos,
            partes.map(([moradorId, texto]) => ({
              moradorId,
              centesimos: percentualParaCentesimos(texto),
            })),
            pagadorId,
          );
  }
  return { descricao, valorCentavos, data, pagadorId, tipoDivisao, participacoes };
}
