import { prisma } from "../db";
import { diaDa } from "../despesas/dia";
import { montaExtrato } from "./calculo";
import { intervaloDoMes } from "./mes";

/** Extrato de um mês da república (E1). Só busca; a conta é de montaExtrato. */
export async function buscaExtrato(republicaId: number, mes: string) {
  const { inicio, fim } = intervaloDoMes(mes);
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  const despesas = await prisma.despesa.findMany({
    // Despesa excluída (B6) não entra no extrato.
    where: { republicaId, excluidaEm: null, data: { gte: inicio, lt: fim } },
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

  return montaExtrato(
    mes,
    moradores,
    despesas.map((despesa) => ({ ...despesa, data: diaDa(despesa.data) })),
  );
}
