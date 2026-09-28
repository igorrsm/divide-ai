import { prisma } from "../db";
import { ErroDeValidacao } from "../erros";
import { ratearIgualmente } from "./rateio";
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
 * Cria a despesa rateada igualmente entre todos os moradores da república.
 * Quem pagou também participa, e a sobra de centavos fica com ele.
 *
 * A despesa e as participações entram na mesma operação aninhada, que o Prisma
 * resolve em transação: não fica despesa gravada sem rateio se algo falhar no
 * meio.
 *
 * Escolher quem participa é a B4; dividir por valor ou percentual, a B5.
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

  // Uma consulta só: serve para validar quem pagou e para montar o rateio.
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  // Precisa ser morador desta república, não de outra.
  if (!moradores.some((morador) => morador.id === pagadorId)) {
    throw new ErroDeValidacao("Quem pagou precisa ser um morador desta república.");
  }

  const participacoes = ratearIgualmente(
    valorCentavos,
    moradores.map((morador) => morador.id),
    pagadorId,
  );

  return prisma.despesa.create({
    data: {
      descricao,
      valorCentavos,
      data,
      republicaId,
      pagadorId,
      tipoDivisao: "IGUAL",
      participacoes: { create: participacoes },
    },
    include: {
      participacoes: {
        select: { moradorId: true, valorCentavos: true },
        orderBy: { moradorId: "asc" },
      },
    },
  });
}
