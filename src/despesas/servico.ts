import { prisma } from "../db";
import { ErroNaoEncontrado, ErroSemPermissao } from "../erros";
import { diaDa } from "./dia";
import type { FiltrosDespesas } from "./filtros";
import { montaDespesa, type EntradaDespesa } from "./montagem";
import { interpretaId } from "./validacao";

export function buscaRepublica(id: number) {
  return prisma.republica.findUnique({ where: { id } });
}

/**
 * Despesas da república, da mais recente para a mais antiga (B3), com os
 * filtros opcionais da E2. O filtro de moradores pega o que algum deles
 * pagou ou do que participa: tudo o que mexe no saldo de algum deles.
 */
export async function listaDespesas(republicaId: number, filtros: FiltrosDespesas = {}) {
  const { desde, antesDe, moradorIds } = filtros;
  const despesas = await prisma.despesa.findMany({
    where: {
      republicaId,
      // Despesa excluída (B6) some da lista.
      excluidaEm: null,
      ...(desde || antesDe ? { data: { gte: desde, lt: antesDe } } : {}),
      ...(moradorIds
        ? {
            OR: [
              { pagadorId: { in: moradorIds } },
              { participacoes: { some: { moradorId: { in: moradorIds } } } },
            ],
          }
        : {}),
    },
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
    // Despesa excluída (B6) dá 404, como a que não existe.
    where: { id: despesaId, republicaId, excluidaEm: null },
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
 * Cria a despesa rateada igualmente entre os participantes escolhidos (B4).
 * Sem escolha, participam todos os moradores da república.
 *
 * Quem pagou não é forçado dentro do rateio: dá para lançar uma despesa que
 * alguém pagou para os outros. Quando ele participa, a sobra de centavos fica
 * com ele; quando não, vai para o participante de menor id. Quem não participa
 * nunca ganha participação.
 *
 * A despesa e as participações entram na mesma operação aninhada, que o Prisma
 * resolve em transação: não fica despesa gravada sem rateio se algo falhar no
 * meio.
 *
 * Dividir por valor ou percentual é a B5.
 */
export async function criarDespesa(
  republicaId: number,
  entrada: EntradaDespesa,
  hoje: Date = new Date(),
) {
  // Uma consulta só: serve para validar quem pagou e os participantes.
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const { participacoes, ...campos } = montaDespesa(
    entrada,
    moradores.map((morador) => morador.id),
    hoje,
  );

  return prisma.despesa.create({
    data: {
      ...campos,
      republicaId,
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

/**
 * Só quem pagou edita ou exclui a despesa (B6). Sem login, "quem está usando"
 * é o morador escolhido em "Quem é você?", que a tela manda como moradorId:
 * é uma trava de uso, não de segurança.
 */
async function exigePagador(republicaId: number, despesaId: number, moradorId: unknown) {
  const despesa = await prisma.despesa.findFirst({
    where: { id: despesaId, republicaId, excluidaEm: null },
    select: { pagadorId: true },
  });
  if (!despesa) throw new ErroNaoEncontrado("Despesa não encontrada.");
  if (interpretaId(moradorId, "Quem está usando o app") !== despesa.pagadorId) {
    throw new ErroSemPermissao("Só quem pagou pode editar ou excluir esta despesa.");
  }
}

/**
 * Edita a despesa com as mesmas regras de lançar e refaz o rateio (B6). As
 * participações antigas saem e as novas entram na mesma operação aninhada,
 * em transação: não fica despesa sem rateio no meio do caminho.
 */
export async function editarDespesa(
  republicaId: number,
  despesaId: number,
  entrada: EntradaDespesa & { moradorId?: unknown },
  hoje: Date = new Date(),
) {
  await exigePagador(republicaId, despesaId, entrada.moradorId);
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const { participacoes, ...campos } = montaDespesa(
    entrada,
    moradores.map((morador) => morador.id),
    hoje,
  );
  return prisma.despesa.update({
    where: { id: despesaId },
    data: { ...campos, participacoes: { deleteMany: {}, create: participacoes } },
  });
}

/** Exclusão lógica (B6): marca excluidaEm e mantém a linha no banco. */
export async function excluirDespesa(republicaId: number, despesaId: number, moradorId: unknown) {
  await exigePagador(republicaId, despesaId, moradorId);
  await prisma.despesa.update({ where: { id: despesaId }, data: { excluidaEm: new Date() } });
}
