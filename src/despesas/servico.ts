import { prisma } from "../db";
import { ErroDeValidacao } from "../erros";
import {
  interpretaData,
  interpretaDescricao,
  interpretaId,
  reaisParaCentavos,
} from "./validacao";

export type EntradaNovaDespesa = {
  descricao?: unknown;
  valor?: unknown;
  data?: unknown;
  pagadorId?: unknown;
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

export function buscaRepublica(id: number) {
  return prisma.republica.findUnique({ where: { id } });
}

export function listaMoradores(republicaId: number) {
  return prisma.morador.findMany({
    where: { republicaId },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}

/**
 * Cria a despesa sem participações: o rateio é a história B2.
 *
 * Enquanto B2 não entra, a soma das participações não bate com o valor da
 * despesa. A invariante volta a valer quando o rateio for implementado.
 */
export async function criarDespesa(
  republicaId: number,
  entrada: EntradaNovaDespesa,
  hoje: Date = new Date(),
) {
  const descricao = interpretaDescricao(comoTexto(entrada.descricao, "Descrição"));
  const valorCentavos = reaisParaCentavos(comoTexto(entrada.valor, "Valor"));
  const data = interpretaData(comoTexto(entrada.data, "Data"), hoje);
  const pagadorId = interpretaId(entrada.pagadorId, "Quem pagou");

  // Precisa ser morador desta república, não de outra.
  const pagador = await prisma.morador.findFirst({
    where: { id: pagadorId, republicaId },
  });
  if (!pagador) {
    throw new ErroDeValidacao("Quem pagou precisa ser um morador desta república.");
  }

  return prisma.despesa.create({
    data: { descricao, valorCentavos, data, republicaId, pagadorId },
  });
}
