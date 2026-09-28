import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { intervaloDoMes, interpretaMes } from "./mes";

describe("interpretaMes", () => {
  it("aceita AAAA-MM", () => {
    assert.equal(interpretaMes("2026-09"), "2026-09");
    assert.equal(interpretaMes(" 2026-12 "), "2026-12");
  });

  it("sem o parâmetro, usa o mês de hoje no fuso da casa", () => {
    // 1º/10 às 01h UTC ainda é 30/09 às 22h em São Paulo.
    assert.equal(interpretaMes(undefined, new Date("2026-10-01T01:00:00Z")), "2026-09");
    assert.equal(interpretaMes("", new Date("2026-10-01T12:00:00Z")), "2026-10");
  });

  it("recusa mês fora do formato ou inexistente", () => {
    for (const bruto of ["abc", "2026-13", "2026-00", "2026-9", "09-2026", ["2026-09"]]) {
      assert.throws(() => interpretaMes(bruto), /Mês inválido/);
    }
  });
});

describe("intervaloDoMes", () => {
  it("vai do dia 1º à meia-noite UTC até o 1º do mês seguinte", () => {
    const { inicio, fim } = intervaloDoMes("2026-09");
    assert.equal(inicio.toISOString(), "2026-09-01T00:00:00.000Z");
    assert.equal(fim.toISOString(), "2026-10-01T00:00:00.000Z");
  });

  it("dezembro termina em janeiro do ano seguinte", () => {
    assert.equal(intervaloDoMes("2026-12").fim.toISOString(), "2027-01-01T00:00:00.000Z");
  });
});
