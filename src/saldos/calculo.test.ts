import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcularSaldos, type DespesaDoSaldo, type SaldoMorador } from "./calculo";

const ANA = { id: 1, nome: "Ana" };
const BRUNO = { id: 2, nome: "Bruno" };
const CARLA = { id: 3, nome: "Carla" };
const DAVI = { id: 4, nome: "Davi" };
const CASA = [ANA, BRUNO, CARLA];

// Despesas do seed: aluguel pago pela Ana entre os três, mercado pago pelo
// Bruno só entre ele e a Carla.
const ALUGUEL: DespesaDoSaldo = {
  pagadorId: ANA.id,
  valorCentavos: 240000,
  participacoes: [
    { moradorId: ANA.id, valorCentavos: 80000 },
    { moradorId: BRUNO.id, valorCentavos: 80000 },
    { moradorId: CARLA.id, valorCentavos: 80000 },
  ],
};
const MERCADO: DespesaDoSaldo = {
  pagadorId: BRUNO.id,
  valorCentavos: 15000,
  participacoes: [
    { moradorId: BRUNO.id, valorCentavos: 7500 },
    { moradorId: CARLA.id, valorCentavos: 7500 },
  ],
};

/** Saldo por nome, e confere a invariante: a soma da república é zero. */
function porNome(saldos: SaldoMorador[]): Record<string, number> {
  assert.equal(
    saldos.reduce((soma, s) => soma + s.saldoCentavos, 0),
    0,
    "a soma dos saldos da república deve ser zero",
  );
  return Object.fromEntries(saldos.map((s) => [s.nome, s.saldoCentavos]));
}

describe("calcularSaldos", () => {
  it("dá o rótulo pelo sinal do saldo", () => {
    const saldos = calcularSaldos([ANA, BRUNO, CARLA, DAVI], [MERCADO], []);
    assert.deepEqual(
      saldos.map((s) => s.situacao),
      ["quitado", "a receber", "a pagar", "quitado"],
    );
  });

  it("despesa que eu paguei e da qual participo: recebo a parte dos outros", () => {
    assert.deepEqual(porNome(calcularSaldos(CASA, [ALUGUEL], [])), {
      Ana: 160000,
      Bruno: -80000,
      Carla: -80000,
    });
  });

  it("despesa que outro pagou: devo a minha parte", () => {
    assert.equal(porNome(calcularSaldos(CASA, [MERCADO], [])).Carla, -7500);
  });

  it("despesa em que eu não participo não mexe no meu saldo", () => {
    assert.equal(porNome(calcularSaldos(CASA, [MERCADO], [])).Ana, 0);
  });

  it("república sem despesas: todos quitados", () => {
    const saldos = calcularSaldos(CASA, [], []);
    assert.deepEqual(porNome(saldos), { Ana: 0, Bruno: 0, Carla: 0 });
    assert.ok(saldos.every((s) => s.situacao === "quitado"));
  });

  it("pagador fora do rateio, com sobra de 2 centavos no menor id", () => {
    // Carla paga R$ 100,01 entre Ana, Bruno e Davi: 10001 = 3333 × 3 + 2.
    const despesa: DespesaDoSaldo = {
      pagadorId: CARLA.id,
      valorCentavos: 10001,
      participacoes: [
        { moradorId: ANA.id, valorCentavos: 3335 },
        { moradorId: BRUNO.id, valorCentavos: 3333 },
        { moradorId: DAVI.id, valorCentavos: 3333 },
      ],
    };
    assert.deepEqual(porNome(calcularSaldos([ANA, BRUNO, CARLA, DAVI], [despesa], [])), {
      Ana: -3335,
      Bruno: -3333,
      Carla: 10001,
      Davi: -3333,
    });
  });

  it("cenário do seed", () => {
    assert.deepEqual(porNome(calcularSaldos(CASA, [ALUGUEL, MERCADO], [])), {
      Ana: 160000,
      Bruno: -72500,
      Carla: -87500,
    });
  });

  it("pagar a dívida inteira deixa o devedor quitado", () => {
    // A soma zero não pega sinal trocado nos acertos; este teste pega.
    const acerto = { pagadorId: BRUNO.id, recebedorId: ANA.id, valorCentavos: 72500 };
    const saldos = calcularSaldos(CASA, [ALUGUEL, MERCADO], [acerto]);
    assert.deepEqual(porNome(saldos), { Ana: 87500, Bruno: 0, Carla: -87500 });
    assert.equal(saldos.find((s) => s.nome === "Bruno")?.situacao, "quitado");
  });
});
