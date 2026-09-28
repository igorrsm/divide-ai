import { prisma } from "../db";
import { ErroDeValidacao, ErroNaoEncontrado } from "../erros";
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

/**
 * A data é gravada à meia-noite UTC do dia escolhido (ver interpretaData),
 * então o dia certo é o prefixo do ISO. Converter para o fuso local mostraria
 * o dia anterior no Brasil.
 */
function diaDa(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/** Despesas da república, da mais recente para a mais antiga (B3). */
export async function listaDespesas(republicaId: number) {
  const despesas = await prisma.despesa.findMany({
    where: { republicaId },
    select: {
      id: true,
      descricao: true,
      valorCentavos: true,
      data: true,
      pagador: { select: { id: true, nome: true } },
    },
    // No mesmo dia, a última lançada vem primeiro.
    orderBy: [{ data: "desc" }, { id: "desc" }],
  });
  return despesas.map((despesa) => ({ ...despesa, data: diaDa(despesa.data) }));
}

/**
 * Uma despesa com o rateio por morador (B3). Despesa de outra república dá
 * 404, igual à que não existe: não revela que o id existe em outra casa.
 */
export async function buscaDespesa(republicaId: number, despesaId: number) {
  const despesa = await prisma.despesa.findFirst({
    where: { id: despesaId, republicaId },
    select: {
      id: true,
      descricao: true,
      valorCentavos: true,
      data: true,
      tipoDivisao: true,
      pagador: { select: { id: true, nome: true } },
      participacoes: {
        select: { valorCentavos: true, morador: { select: { id: true, nome: true } } },
        orderBy: { morador: { nome: "asc" } },
      },
    },
  });
  if (!despesa) throw new ErroNaoEncontrado("Despesa não encontrada.");
  return { ...despesa, data: diaDa(despesa.data) };
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
