import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { montaPagamento } from "./validacao";

const HOJE = new Date("2026-09-28T15:00:00.000Z");
const CASA = [1, 2, 3];
const ENTRADA = { pagadorId: 2, recebedorId: 1, valor: "100,50", data: "2026-09-28" };

describe("montaPagamento", () => {
  it("monta o acerto com valor em centavos e data à meia-noite UTC", () => {
    assert.deepEqual(montaPagamento(ENTRADA, CASA, HOJE), {
      pagadorId: 2,
      recebedorId: 1,
      valorCentavos: 10050,
      data: new Date("2026-09-28T00:00:00.000Z"),
    });
  });

  it("aceita os ids como texto, como vêm do formulário", () => {
    const pagamento = montaPagamento({ ...ENTRADA, pagadorId: "3", recebedorId: "1" }, CASA, HOJE);
    assert.equal(pagamento.pagadorId, 3);
  });

  it("recusa pagamento para si mesmo", () => {
    assert.throws(
      () => montaPagamento({ ...ENTRADA, recebedorId: 2 }, CASA, HOJE),
      /para si mesmo/,
    );
  });

  it("recusa morador de outra casa", () => {
    assert.throws(() => montaPagamento({ ...ENTRADA, recebedorId: 9 }, CASA, HOJE), /não é desta/);
  });

  it("recusa valor zero, data futura e campo faltando", () => {
    assert.throws(() => montaPagamento({ ...ENTRADA, valor: "0" }, CASA, HOJE), /maior que zero/);
    assert.throws(() => montaPagamento({ ...ENTRADA, data: "2026-09-29" }, CASA, HOJE), /futura/);
    assert.throws(() => montaPagamento({ ...ENTRADA, valor: undefined }, CASA, HOJE), /obrigatório/);
  });
});
