import { prisma } from "../db";
import { ErroDeValidacao, ErroNaoEncontrado, ErroSemPermissao } from "../erros";
import { DESPESA_ATIVA } from "./ativa";
import { diaDa } from "./dia";
import type { FiltrosDespesas } from "./filtros";
import { montaDespesa, type EntradaDespesa } from "./montagem";
import { intervaloDoMes } from "../extrato/mes";
import { diaDoMesDa, interpretaRecorrente, lancamentosDoMes } from "./recorrencia";
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
      ...DESPESA_ATIVA,
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
      recorrente: { select: { ativa: true } },
    },
    // No mesmo dia, a última lançada vem primeiro.
    orderBy: [{ data: "desc" }, { id: "desc" }],
  });
  // Recorrência parada (C1) conta como avulsa; o registro fica no banco.
  return despesas.map(({ recorrente, ...despesa }) => ({
    ...despesa,
    data: diaDa(despesa.data),
    recorrente: recorrente?.ativa === true,
  }));
}

/**
 * Uma despesa com o rateio por morador (B3). Despesa de outra república dá
 * 404, igual à que não existe: não revela que o id existe em outra casa.
 */
export async function buscaDespesa(republicaId: number, despesaId: number) {
  const despesa = await prisma.despesa.findFirst({
    // Despesa excluída (B6) dá 404, como a que não existe.
    where: { id: despesaId, republicaId, ...DESPESA_ATIVA },
    select: {
      id: true,
      descricao: true,
      valorCentavos: true,
      data: true,
      tipoDivisao: true,
      pagador: { select: { id: true, nome: true } },
      participacoes: {
        select: {
          valorCentavos: true,
          percentualCentesimos: true,
          morador: { select: { id: true, nome: true } },
        },
        orderBy: { morador: { nome: "asc" } },
      },
      recorrente: { select: { ativa: true, diaDoMes: true } },
    },
  });
  if (!despesa) throw new ErroNaoEncontrado("Despesa não encontrada.");
  const { recorrente, ...resto } = despesa;
  return {
    ...resto,
    data: diaDa(despesa.data),
    // C1: null quando é avulsa ou parou de repetir.
    recorrencia: recorrente?.ativa ? { diaDoMes: recorrente.diaDoMes } : null,
  };
}

export function listaMoradores(republicaId: number) {
  return prisma.morador.findMany({
    where: { republicaId },
    // E-mail e organizador servem à tela de moradores (A2).
    select: { id: true, nome: true, email: true, organizador: true },
    orderBy: { nome: "asc" },
  });
}

/**
 * Cria a despesa rateada entre os participantes escolhidos (B4): por igual,
 * por valores ou por percentuais (B5). Sem escolha, participam todos os
 * moradores da república.
 *
 * Quem pagou não é forçado dentro do rateio: dá para lançar uma despesa que
 * alguém pagou para os outros. Quando ele participa, a sobra de centavos fica
 * com ele; quando não, vai para o participante de menor id. Quem não participa
 * nunca ganha participação.
 *
 * A despesa e as participações entram na mesma operação aninhada, que o Prisma
 * resolve em transação: não fica despesa gravada sem rateio se algo falhar no
 * meio.
 */
export async function criarDespesa(
  republicaId: number,
  entrada: EntradaDespesa & { recorrente?: unknown },
  hoje: Date = new Date(),
) {
  const recorrente = interpretaRecorrente(entrada.recorrente);
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
      participacoes: { create: participacoes },
      // C1: repete no dia do mês da data da despesa.
      ...(recorrente ? { recorrente: { create: { diaDoMes: diaDoMesDa(campos.data) } } } : {}),
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
    where: { id: despesaId, republicaId, ...DESPESA_ATIVA },
    select: { pagadorId: true },
  });
  if (!despesa) throw new ErroNaoEncontrado("Despesa não encontrada.");
  // Sem o campo, a pessoa não escolheu quem é: a frase diz o que fazer.
  if (moradorId === undefined || moradorId === null || moradorId === "") {
    throw new ErroDeValidacao('Escolha quem você é em "Quem é você?" antes de editar ou excluir.');
  }
  if (interpretaId(moradorId, "Id de quem está usando o app") !== despesa.pagadorId) {
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
  entrada: EntradaDespesa & { moradorId?: unknown; recorrente?: unknown },
  hoje: Date = new Date(),
) {
  await exigePagador(republicaId, despesaId, entrada.moradorId);
  const recorrente = interpretaRecorrente(entrada.recorrente);
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
  const diaDoMes = diaDoMesDa(campos.data);
  // Uma transação só: a despesa e a recorrência (C1) mudam juntas.
  return prisma.$transaction(async (tx) => {
    const despesa = await tx.despesa.update({
      where: { id: despesaId },
      data: {
        ...campos,
        participacoes: { deleteMany: {}, create: participacoes },
        // Marcar cria ou reativa, no dia da data (que pode ter mudado).
        ...(recorrente
          ? {
              recorrente: {
                upsert: {
                  create: { diaDoMes },
                  update: { diaDoMes, ativa: true, dataFim: null },
                },
              },
            }
          : {}),
      },
    });
    if (recorrente === false) await pararRecorrencia(tx, despesaId, hoje);
    return despesa;
  });
}

type Transacao = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Desmarcar (C1) não apaga: desativa e guarda quando parou, para o histórico
 * não se perder. Sem recorrência ativa, não faz nada.
 */
function pararRecorrencia(tx: Transacao, despesaId: number, hoje: Date) {
  return tx.despesaRecorrente.updateMany({
    where: { id: despesaId, ativa: true },
    data: { ativa: false, dataFim: hoje },
  });
}

/** "Parar de repetir" no detalhe (C1): só quem pagou, como editar e excluir. */
export async function pararDeRepetir(
  republicaId: number,
  despesaId: number,
  moradorId: unknown,
  hoje: Date = new Date(),
) {
  await exigePagador(republicaId, despesaId, moradorId);
  await prisma.$transaction((tx) => pararRecorrencia(tx, despesaId, hoje));
}

/** Exclusão lógica (B6): marca excluidaEm e mantém a linha no banco. */
export async function excluirDespesa(republicaId: number, despesaId: number, moradorId: unknown) {
  await exigePagador(republicaId, despesaId, moradorId);
  await prisma.despesa.update({ where: { id: despesaId }, data: { excluidaEm: new Date() } });
}

/**
 * Gera os lançamentos do mês a partir das despesas recorrentes (C2), por ação
 * explícita do morador, sem agendador. Cada lançamento é uma despesa comum,
 * cópia do modelo (mesmo pagador e mesmas participações, então a soma bate).
 *
 * A trava da idempotência é a atualização de `ultimaGeracao`: ela só pega a
 * linha se o mês ainda não foi gerado, e o lançamento só é criado nesse caso.
 * Assim, nem dois cliques ao mesmo tempo duplicam.
 */
export async function gerarRecorrentes(republicaId: number, mes: string, agora = new Date()) {
  const modelos = await prisma.despesa.findMany({
    where: { republicaId, ...DESPESA_ATIVA, recorrente: { isNot: null } },
    select: {
      id: true,
      descricao: true,
      valorCentavos: true,
      data: true,
      tipoDivisao: true,
      pagadorId: true,
      recorrente: { select: { diaDoMes: true, ativa: true, ultimaGeracao: true } },
      participacoes: {
        select: { moradorId: true, valorCentavos: true, percentualCentesimos: true },
      },
    },
  });
  const lancamentos = lancamentosDoMes(
    mes,
    modelos.flatMap((m) => (m.recorrente ? [{ id: m.id, data: m.data, ...m.recorrente }] : [])),
    agora,
  );
  const { inicio } = intervaloDoMes(mes);

  return prisma.$transaction(async (tx) => {
    const criados = [];
    for (const { modeloId, data } of lancamentos) {
      const marcou = await tx.despesaRecorrente.updateMany({
        where: { id: modeloId, OR: [{ ultimaGeracao: null }, { ultimaGeracao: { lt: inicio } }] },
        data: { ultimaGeracao: inicio },
      });
      if (marcou.count === 0) continue;
      const { descricao, valorCentavos, tipoDivisao, pagadorId, participacoes } = modelos.find(
        (m) => m.id === modeloId,
      )!;
      const despesa = await tx.despesa.create({
        data: {
          descricao,
          valorCentavos,
          tipoDivisao,
          pagadorId,
          data,
          republicaId,
          participacoes: { create: participacoes },
        },
        select: { id: true, descricao: true, valorCentavos: true, data: true },
      });
      criados.push({ ...despesa, data: diaDa(despesa.data) });
    }
    return criados;
  });
}
