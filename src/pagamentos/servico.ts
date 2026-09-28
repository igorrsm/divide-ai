import { prisma } from "../db";
import { diaDa } from "../despesas/dia";
import { montaPagamento, type EntradaPagamento } from "./validacao";

/** Registra um acerto entre moradores (D3). O saldo é derivado, não gravado. */
export async function registrarPagamento(
  republicaId: number,
  entrada: EntradaPagamento,
  hoje: Date = new Date(),
) {
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true },
  });
  const pagamento = montaPagamento(
    entrada,
    moradores.map((morador) => morador.id),
    hoje,
  );
  const criado = await prisma.pagamento.create({ data: { ...pagamento, republicaId } });
  return { ...criado, data: diaDa(criado.data) };
}

/** Acertos da república, do mais recente para o mais antigo (D3). */
export async function listaPagamentos(republicaId: number) {
  const pagamentos = await prisma.pagamento.findMany({
    where: { republicaId },
    select: {
      id: true,
      valorCentavos: true,
      data: true,
      pagador: { select: { id: true, nome: true } },
      recebedor: { select: { id: true, nome: true } },
    },
    orderBy: [{ data: "desc" }, { id: "desc" }],
  });
  return pagamentos.map((pagamento) => ({ ...pagamento, data: diaDa(pagamento.data) }));
}
