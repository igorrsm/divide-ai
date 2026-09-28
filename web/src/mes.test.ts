import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatarMes, mesVizinho } from "./mes";

describe("formatarMes", () => {
  it("escreve o mês por extenso", () => {
    assert.equal(formatarMes("2026-09"), "setembro de 2026");
    assert.equal(formatarMes("2027-01"), "janeiro de 2027");
  });
});

describe("mesVizinho", () => {
  it("anda um mês para trás e para frente", () => {
    assert.equal(mesVizinho("2026-09", -1), "2026-08");
    assert.equal(mesVizinho("2026-09", 1), "2026-10");
  });

  it("vira o ano", () => {
    assert.equal(mesVizinho("2026-12", 1), "2027-01");
    assert.equal(mesVizinho("2026-01", -1), "2025-12");
  });
});
