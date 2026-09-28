import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { percentualParaCentesimos, ratearPorPercentuais, ratearPorValores } from "./divisao";

describe("percentualParaCentesimos", () => {
  it("converte sem ponto flutuante", () => {
    assert.equal(percentualParaCentesimos("50"), 5000);
    assert.equal(percentualParaCentesimos("33,33"), 3333);
    assert.equal(percentualParaCentesimos("33.3"), 3330);
    assert.equal(percentualParaCentesimos(" 0,01 "), 1);
  });

  it("recusa zero, negativo, texto e mais de duas casas", () => {
    for (const texto of ["0", "0,00", "-10", "abc", "33,333", ""]) {
      assert.throws(() => percentualParaCentesimos(texto));
    }
  });
});

describe("ratearPorValores", () => {
  it("usa os valores informados quando a soma fecha", () => {
    assert.deepEqual(
      ratearPorValores(10000, [
        { moradorId: 1, centavos: 7000 },
        { moradorId: 2, centavos: 3000 },
      ]),
      [
        { moradorId: 1, valorCentavos: 7000 },
        { moradorId: 2, valorCentavos: 3000 },
      ],
    );
  });

  it("recusa soma diferente do total, dizendo as duas somas", () => {
    assert.throws(
      () => ratearPorValores(10000, [{ moradorId: 1, centavos: 9000 }]),
      /soma dos valores \(R\$ 90,00\) é diferente do total da despesa \(R\$ 100,00\)/,
    );
    assert.throws(
      () => ratearPorValores(100000, [{ moradorId: 1, centavos: 123456 }]),
      /R\$ 1\.234,56.*R\$ 1\.000,00/,
    );
  });
});

describe("ratearPorPercentuais", () => {
  const TERCOS = [
    { moradorId: 1, centesimos: 3333 },
    { moradorId: 2, centesimos: 3333 },
    { moradorId: 3, centesimos: 3334 },
  ];

  it("calcula cada parte e guarda o percentual", () => {
    assert.deepEqual(
      ratearPorPercentuais(20000, [
        { moradorId: 1, centesimos: 7500 },
        { moradorId: 2, centesimos: 2500 },
      ], 1),
      [
        { moradorId: 1, valorCentavos: 15000, percentualCentesimos: 7500 },
        { moradorId: 2, valorCentavos: 5000, percentualCentesimos: 2500 },
      ],
    );
  });

  it("a sobra de centavos vai para quem pagou e a soma fecha", () => {
    // R$ 100,00 em 33,33/33,33/33,34: 3333 + 3333 + 3334, sem sobra.
    const exato = ratearPorPercentuais(10000, TERCOS, 2);
    assert.deepEqual(exato.map((p) => p.valorCentavos), [3333, 3333, 3334]);
    // R$ 10,01: 333,6 + 333,6 + 333,7 → 333 + 333 + 333 e sobram 2, para quem pagou (2).
    const comSobra = ratearPorPercentuais(1001, TERCOS, 2);
    assert.deepEqual(comSobra.map((p) => p.valorCentavos), [333, 335, 333]);
  });

  it("sem quem pagou no rateio, a sobra vai para o menor id", () => {
    const metades = TERCOS.slice(1).map((p) => ({ ...p, centesimos: 5000 }));
    const partes = ratearPorPercentuais(1001, metades, 1);
    assert.deepEqual(partes.map((p) => [p.moradorId, p.valorCentavos]), [[2, 501], [3, 500]]);
  });

  it("recusa soma diferente de 100%", () => {
    assert.throws(
      () => ratearPorPercentuais(10000, [{ moradorId: 1, centesimos: 9000 }], 1),
      /soma dos percentuais é 90%, e precisa ser 100%/,
    );
    assert.throws(
      () => ratearPorPercentuais(10000, [{ moradorId: 1, centesimos: 10050 }], 1),
      /é 100,5%/,
    );
  });
});
