import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcularSaldos } from "../saldos/calculo";
import { sugerirTransferencias } from "../saldos/transferencias";
import { montaExtrato } from "./calculo";
import { campoCsv, fechamentoParaCsv, reaisCsv, type DadosDoFechamento } from "./csv";

const CASA = [
  { id: 1, nome: "Ana" },
  { id: 2, nome: "Bruno" },
  { id: 3, nome: "Carla" },
];
// Mercado do seed, pago pelo Bruno entre ele e a Carla.
const MERCADO = {
  id: 2,
  descricao: "Compra do mês; mercado",
  valorCentavos: 15000,
  data: "2026-09-10",
  pagador: { id: 2, nome: "Bruno" },
  participacoes: [
    { moradorId: 2, valorCentavos: 7500 },
    { moradorId: 3, valorCentavos: 7500 },
  ],
};

function dados(mudancas: Partial<DadosDoFechamento> = {}): DadosDoFechamento {
  const saldos = calcularSaldos(
    CASA,
    [{ pagadorId: 2, valorCentavos: 15000, participacoes: MERCADO.participacoes }],
    [],
  );
  return {
    republica: "República Demo",
    hoje: "2026-09-28",
    extrato: montaExtrato("2026-09", CASA, [MERCADO]),
    saldos,
    transferencias: sugerirTransferencias(saldos),
    saidas: new Map([[3, "2026-09-28"]]),
    ...mudancas,
  };
}

describe("reaisCsv e campoCsv", () => {
  it("escreve centavos em reais com vírgula, sem separador de milhar", () => {
    assert.equal(reaisCsv(5), "0,05");
    assert.equal(reaisCsv(240000), "2400,00");
    assert.equal(reaisCsv(-72500), "-725,00");
  });

  it("põe entre aspas o campo com ; ou aspas, dobrando as aspas", () => {
    assert.equal(campoCsv("Aluguel"), "Aluguel");
    assert.equal(campoCsv("Gás; luz"), '"Gás; luz"');
    assert.equal(campoCsv('Pizza "grande"'), '"Pizza ""grande"""');
  });
});

describe("fechamentoParaCsv", () => {
  const linhas = fechamentoParaCsv(dados()).split("\r\n");

  it("abre com o mês por extenso e o nome da casa", () => {
    assert.equal(linhas[0], "Fechamento de setembro de 2026;República Demo");
  });

  it("lista as despesas e fecha com o total da casa", () => {
    assert.ok(linhas.includes('10/09/2026;"Compra do mês; mercado";Bruno;150,00'));
    assert.ok(linhas.includes("Total da casa;;;150,00"));
  });

  it("marca quem saiu nos totais e nos saldos", () => {
    assert.ok(linhas.includes("Carla (saiu em 28/09/2026);75,00;0,00"));
    assert.ok(linhas.includes("Carla (saiu em 28/09/2026);-75,00;a pagar"));
  });

  it("termina com os acertos sugeridos, ou com ninguém devendo", () => {
    assert.ok(linhas.includes("Carla;Bruno;75,00"));
    const quitado = fechamentoParaCsv(dados({ transferencias: [] })).split("\r\n");
    assert.ok(quitado.includes("Ninguém deve nada"));
  });
});
