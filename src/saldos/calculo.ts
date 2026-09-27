export type MoradorDoSaldo = { id: number; nome: string };

export type DespesaDoSaldo = {
  pagadorId: number;
  valorCentavos: number;
  participacoes: { moradorId: number; valorCentavos: number }[];
};

export type PagamentoDoSaldo = {
  pagadorId: number;
  recebedorId: number;
  valorCentavos: number;
};

export type Situacao = "a receber" | "a pagar" | "quitado";

export type SaldoMorador = {
  moradorId: number;
  nome: string;
  saldoCentavos: number;
  situacao: Situacao;
};

function situacaoDe(saldoCentavos: number): Situacao {
  if (saldoCentavos > 0) return "a receber";
  if (saldoCentavos < 0) return "a pagar";
  return "quitado";
}

/**
 * Saldo de cada morador, derivado e nunca armazenado:
 *
 *   saldo = pagou em despesas − soma das participações
 *         + acertos que pagou − acertos que recebeu
 *
 * Pagar um acerto funciona como pagar uma despesa do outro: quem paga a dívida
 * inteira fica quitado. Positivo é "a receber"; negativo, "a pagar". Só soma
 * inteiros em centavos, então não há arredondamento: se as participações de
 * cada despesa somam o valor dela, a soma dos saldos da república é zero.
 */
export function calcularSaldos(
  moradores: MoradorDoSaldo[],
  despesas: DespesaDoSaldo[],
  pagamentos: PagamentoDoSaldo[],
): SaldoMorador[] {
  const saldos = new Map<number, number>(moradores.map((m) => [m.id, 0]));
  const somar = (moradorId: number, centavos: number) => {
    saldos.set(moradorId, (saldos.get(moradorId) ?? 0) + centavos);
  };

  for (const despesa of despesas) {
    somar(despesa.pagadorId, despesa.valorCentavos);
    for (const participacao of despesa.participacoes) {
      somar(participacao.moradorId, -participacao.valorCentavos);
    }
  }

  for (const pagamento of pagamentos) {
    somar(pagamento.pagadorId, pagamento.valorCentavos);
    somar(pagamento.recebedorId, -pagamento.valorCentavos);
  }

  return moradores.map((morador) => {
    const saldoCentavos = saldos.get(morador.id) ?? 0;
    return {
      moradorId: morador.id,
      nome: morador.nome,
      saldoCentavos,
      situacao: situacaoDe(saldoCentavos),
    };
  });
}
