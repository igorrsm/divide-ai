import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("fuso dos testes", () => {
  it("roda no fuso de São Paulo (scripts/fuso-dos-testes.ts)", () => {
    // Em 1º de janeiro São Paulo está 3 horas atrás de UTC. Se alguém tirar o
    // --import do npm test, este teste acusa antes dos testes de data.
    assert.equal(new Date(2026, 0, 1).getTimezoneOffset(), 180);
  });
});
