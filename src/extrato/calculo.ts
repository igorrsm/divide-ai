/** Uma despesa do mês, já com o dia em AAAA-MM-DD. */
export type DespesaDoExtrato = {
  id: number;
  descricao: string;
  valorCentavos: number;
  data: string;
  pagador: { id: number; nome: string };
  participacoes: { moradorId: number; valorCentavos: number }[];
};

/** O total de um morador no mês. */
export type LinhaDoExtrato = {
  id: number;
  nome: string;
  /** A parte dele nas despesas do mês: soma das participações. */
  aPagarCentavos: number;
  /** Quanto ele adiantou no mês: soma das despesas que ele pagou. */
  pagoCentavos: number;
};

/**
 * Extrato do mês (E1): total da casa, total por morador e as despesas.
 *
 * Função pura, como `calcularSaldos`: o serviço só busca as despesas do mês.
 * Acertos (D3) ficam de fora de propósito, porque são pagamentos entre
 * moradores e não gastos da casa; o saldo continua sendo o lugar deles.
 * Todo morador aparece, mesmo sem despesa no mês, para o extrato conferir a
 * casa inteira.
 */
export function montaExtrato(
  mes: string,
  moradores: { id: number; nome: string }[],
  despesas: DespesaDoExtrato[],
) {
  const linhas = new Map<number, LinhaDoExtrato>(
    moradores.map((m) => [m.id, { id: m.id, nome: m.nome, aPagarCentavos: 0, pagoCentavos: 0 }]),
  );
  let totalCentavos = 0;

  for (const despesa of despesas) {
    totalCentavos += despesa.valorCentavos;
    const pagador = linhas.get(despesa.pagador.id);
    if (pagador) pagador.pagoCentavos += despesa.valorCentavos;
    for (const participacao of despesa.participacoes) {
      const linha = linhas.get(participacao.moradorId);
      if (linha) linha.aPagarCentavos += participacao.valorCentavos;
    }
  }

  return {
    mes,
    totalCentavos,
    moradores: [...linhas.values()],
    // A tela não precisa das participações: o rateio fica no detalhe (B3).
    despesas: despesas.map(({ id, descricao, valorCentavos, data, pagador }) => ({
      id,
      descricao,
      valorCentavos,
      data,
      pagador,
    })),
  };
}
