import type { SaldoMorador } from "../saldos/calculo";
import type { Transferencia } from "../saldos/transferencias";
import type { montaExtrato } from "./calculo";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Tudo o que entra no arquivo do fechamento (E3). */
export type DadosDoFechamento = {
  republica: string;
  /** Dia de hoje, AAAA-MM-DD: os saldos e os acertos são os de hoje. */
  hoje: string;
  extrato: ReturnType<typeof montaExtrato>;
  saldos: SaldoMorador[];
  transferencias: Transferencia[];
  /** Quem saiu da casa (A4): id → dia da saída, AAAA-MM-DD. */
  saidas: Map<number, string>;
};

/**
 * Centavos em reais com vírgula e sem separador de milhar ("2400,00"), para a
 * planilha em português ler como número. É a camada de apresentação: o banco
 * e a API continuam em centavos.
 */
export function reaisCsv(centavos: number): string {
  const sinal = centavos < 0 ? "-" : "";
  const absoluto = Math.abs(centavos);
  return `${sinal}${Math.floor(absoluto / 100)},${String(absoluto % 100).padStart(2, "0")}`;
}

/** Campo com `;`, aspas ou quebra de linha vai entre aspas, com as internas dobradas. */
export function campoCsv(texto: string): string {
  return /[;"\r\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

/** "2026-09-28" vira "28/09/2026", como texto, sem Date. */
export function dataCsv(dia: string): string {
  return `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}`;
}

/**
 * Fechamento do mês em CSV (E3): despesas e totais do extrato (E1), saldos de
 * hoje com quem saiu marcado (A4) e os acertos sugeridos (D5). Separador ";"
 * e quebra "\r\n", como o Excel em português espera; o BOM entra na rota.
 */
export function fechamentoParaCsv(dados: DadosDoFechamento): string {
  const { extrato, saidas } = dados;
  const nome = (id: number, nomeDoMorador: string) => {
    const saiu = saidas.get(id);
    return saiu ? `${nomeDoMorador} (saiu em ${dataCsv(saiu)})` : nomeDoMorador;
  };
  const [ano, numero] = extrato.mes.split("-").map(Number);
  const linhas: string[][] = [
    [`Fechamento de ${MESES[numero - 1]} de ${ano}`, dados.republica],
    [],
    ["Despesas do mês"],
    ["Data", "Descrição", "Quem pagou", "Valor (R$)"],
    ...extrato.despesas.map((d) => [
      dataCsv(d.data),
      d.descricao,
      d.pagador.nome,
      reaisCsv(d.valorCentavos),
    ]),
    ["Total da casa", "", "", reaisCsv(extrato.totalCentavos)],
    [],
    ["Por morador", "A pagar (R$)", "Pago (R$)"],
    ...extrato.moradores.map((m) => [
      nome(m.id, m.nome),
      reaisCsv(m.aPagarCentavos),
      reaisCsv(m.pagoCentavos),
    ]),
    [],
    [`Saldos em ${dataCsv(dados.hoje)}`, "Saldo (R$)", "Situação"],
    ...dados.saldos.map((s) => [nome(s.moradorId, s.nome), reaisCsv(s.saldoCentavos), s.situacao]),
    [],
    ["Acertos sugeridos", "Para quem", "Valor (R$)"],
    ...(dados.transferencias.length === 0
      ? [["Ninguém deve nada"]]
      : dados.transferencias.map((t) => [
          t.pagador.nome,
          t.recebedor.nome,
          reaisCsv(t.valorCentavos),
        ])),
  ];
  return linhas.map((linha) => linha.map(campoCsv).join(";")).join("\r\n") + "\r\n";
}
