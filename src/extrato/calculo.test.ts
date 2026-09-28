import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { montaExtrato, type DespesaDoExtrato } from "./calculo";

const ANA = { id: 1, nome: "Ana" };
const BRUNO = { id: 2, nome: "Bruno" };
const CARLA = { id: 3, nome: "Carla" };
const CASA = [ANA, BRUNO, CARLA];

// Despesas do seed: aluguel pago pela Ana entre os três, mercado pago pelo
// Bruno só entre ele e a Carla.
const ALUGUEL: DespesaDoExtrato = {
  id: 1,
  descricao: "Aluguel",
  valorCentavos: 240000,
  data: "2026-09-05",
  pagador: ANA,
  participacoes: [
    { moradorId: ANA.id, valorCentavos: 80000 },
    { moradorId: BRUNO.id, valorCentavos: 80000 },
    { moradorId: CARLA.id, valorCentavos: 80000 },
  ],
};
const MERCADO: DespesaDoExtrato = {
  id: 2,
  descricao: "Mercado",
  valorCentavos: 15000,
  data: "2026-09-10",
  pagador: BRUNO,
  participacoes: [
    { moradorId: BRUNO.id, valorCentavos: 7500 },
    { moradorId: CARLA.id, valorCentavos: 7500 },
  ],
};

describe("montaExtrato", () => {
  it("soma o total da casa", () => {
    const extrato = montaExtrato("2026-09", CASA, [MERCADO, ALUGUEL]);
    assert.equal(extrato.totalCentavos, 255000);
  });

  it("separa a parte de cada morador do que ele pagou", () => {
    const extrato = montaExtrato("2026-09", CASA, [MERCADO, ALUGUEL]);
    assert.deepEqual(extrato.moradores, [
      { id: 1, nome: "Ana", aPagarCentavos: 80000, pagoCentavos: 240000 },
      { id: 2, nome: "Bruno", aPagarCentavos: 87500, pagoCentavos: 15000 },
      { id: 3, nome: "Carla", aPagarCentavos: 87500, pagoCentavos: 0 },
    ]);
  });

  it("a soma das partes fecha com o total da casa", () => {
    const extrato = montaExtrato("2026-09", CASA, [MERCADO, ALUGUEL]);
    const partes = extrato.moradores.reduce((soma, m) => soma + m.aPagarCentavos, 0);
    assert.equal(partes, extrato.totalCentavos);
  });

  it("mês sem despesa mostra todos os moradores zerados", () => {
    const extrato = montaExtrato("2026-08", CASA, []);
    assert.equal(extrato.totalCentavos, 0);
    assert.deepEqual(extrato.despesas, []);
    assert.ok(extrato.moradores.every((m) => m.aPagarCentavos === 0 && m.pagoCentavos === 0));
  });

  it("devolve as despesas na ordem recebida e sem as participações", () => {
    const extrato = montaExtrato("2026-09", CASA, [MERCADO, ALUGUEL]);
    assert.deepEqual(
      extrato.despesas.map((d) => d.id),
      [2, 1],
    );
    assert.ok(!("participacoes" in extrato.despesas[0]));
  });
});
