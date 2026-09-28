import { prisma } from "../db";
import { calcularSaldos } from "./calculo";

/**
 * Saldos de todos os moradores da república, em ordem alfabética de nome.
 * Só lê: o saldo nunca é gravado, é sempre derivado das despesas, das
 * participações e dos acertos.
 */
export async function buscaSaldos(republicaId: number) {
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  const despesas = await prisma.despesa.findMany({
    // Despesa excluída (B6) não entra no saldo.
    where: { republicaId, excluidaEm: null },
    select: {
      pagadorId: true,
      valorCentavos: true,
      participacoes: { select: { moradorId: true, valorCentavos: true } },
    },
  });
  const pagamentos = await prisma.pagamento.findMany({
    where: { republicaId },
    select: { pagadorId: true, recebedorId: true, valorCentavos: true },
  });

  return calcularSaldos(moradores, despesas, pagamentos);
}
