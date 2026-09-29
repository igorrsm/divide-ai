import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diaDoTexto, textoRecorrencia } from "./recorrencia";

describe("diaDoTexto", () => {
  it("pega o dia de AAAA-MM-DD", () => {
    assert.equal(diaDoTexto("2026-09-05"), 5);
    assert.equal(diaDoTexto("2026-08-31"), 31);
  });

  it("vazio ou fora do formato vira null", () => {
    assert.equal(diaDoTexto(""), null);
    assert.equal(diaDoTexto("05/09/2026"), null);
  });
});

describe("textoRecorrencia", () => {
  it("diz o dia do mês sempre com dois algarismos", () => {
    assert.equal(textoRecorrencia(5), "Todo mês, no dia 05");
    assert.equal(textoRecorrencia(1), "Todo mês, no dia 01");
    assert.equal(textoRecorrencia(28), "Todo mês, no dia 28");
  });

  it("depois do dia 28, lembra dos meses mais curtos", () => {
    assert.equal(
      textoRecorrencia(31),
      "Todo mês, no dia 31 (ou no último dia, nos meses mais curtos)",
    );
  });
});
