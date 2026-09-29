import { prisma } from "../db";
import { DESPESA_ATIVA } from "../despesas/ativa";
import { diaDa } from "../despesas/dia";
import { buscaRepublica } from "../despesas/servico";
import { hojeNaCasa } from "../despesas/validacao";
import { buscaSaldos } from "../saldos/servico";
import { sugerirTransferencias } from "../saldos/transferencias";
import { montaExtrato } from "./calculo";
import { fechamentoParaCsv } from "./csv";
import { intervaloDoMes } from "./mes";

/** Extrato de um mês da república (E1). Só busca; a conta é de montaExtrato. */
export async function buscaExtrato(republicaId: number, mes: string) {
  const { inicio, fim } = intervaloDoMes(mes);
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true, nome: true, saiuEm: true },
    orderBy: { nome: "asc" },
  });
  const despesas = await prisma.despesa.findMany({
    // Despesa excluída (B6) não entra no extrato.
    where: { republicaId, ...DESPESA_ATIVA, data: { gte: inicio, lt: fim } },
    select: {
      id: true,
      descricao: true,
      valorCentavos: true,
      data: true,
      pagador: { select: { id: true, nome: true } },
      participacoes: { select: { moradorId: true, valorCentavos: true } },
    },
    // Mesma ordem da lista de despesas (B3).
    orderBy: [{ data: "desc" }, { id: "desc" }],
  });

  // Quem saiu (A4) aparece nos meses em que ainda morava na casa, ou se está
  // em alguma despesa do mês, para o total por morador fechar com o da casa.
  const nasDespesas = new Set(
    despesas.flatMap((d) => [d.pagador.id, ...d.participacoes.map((p) => p.moradorId)]),
  );
  return montaExtrato(
    mes,
    moradores
      .filter((m) => !m.saiuEm || m.saiuEm >= inicio || nasDespesas.has(m.id))
      .map(({ id, nome }) => ({ id, nome })),
    despesas.map((despesa) => ({ ...despesa, data: diaDa(despesa.data) })),
  );
}

/**
 * Fechamento do mês em CSV (E3): o extrato do mês, os saldos e os acertos
 * sugeridos de hoje, com quem saiu da casa marcado. Só busca; o arquivo é
 * montado por fechamentoParaCsv.
 */
export async function buscaFechamento(republicaId: number, mes: string, agora = new Date()) {
  const saldos = await buscaSaldos(republicaId);
  const saidos = await prisma.morador.findMany({
    where: { republicaId, saiuEm: { not: null } },
    select: { id: true, saiuEm: true },
  });
  return fechamentoParaCsv({
    republica: (await buscaRepublica(republicaId))?.nome ?? "",
    hoje: hojeNaCasa(agora),
    extrato: await buscaExtrato(republicaId, mes),
    saldos,
    transferencias: sugerirTransferencias(saldos),
    saidas: new Map(saidos.map((m) => [m.id, diaDa(m.saiuEm!)])),
  });
}
