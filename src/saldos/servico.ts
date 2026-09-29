import { prisma } from "../db";
import { DESPESA_ATIVA } from "../despesas/ativa";
import { calcularSaldos } from "./calculo";

/**
 * Saldos de todos os moradores da república, em ordem alfabética de nome.
 * Só lê: o saldo nunca é gravado, é sempre derivado das despesas, das
 * participações e dos acertos.
 */
export async function buscaSaldos(republicaId: number) {
  const moradores = await prisma.morador.findMany({
    where: { republicaId },
    select: { id: true, nome: true, saiuEm: true },
    orderBy: { nome: "asc" },
  });
  const despesas = await prisma.despesa.findMany({
    // Despesa excluída (B6) não entra no saldo.
    where: { republicaId, ...DESPESA_ATIVA },
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

  // Quem saiu (A4) continua enquanto tiver o que acertar; quitado, some. A
  // soma da república não muda, porque só sai quem está com saldo zero.
  const saiu = new Set(moradores.filter((m) => m.saiuEm).map((m) => m.id));
  return calcularSaldos(moradores, despesas, pagamentos)
    .map((saldo) => ({ ...saldo, saiu: saiu.has(saldo.moradorId) }))
    .filter((saldo) => !saldo.saiu || saldo.saldoCentavos !== 0);
}
