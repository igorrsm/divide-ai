import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatarReais } from "./formatarReais";
import { avisoDeValor } from "./pagamento";

describe("avisoDeValor", () => {
  it("não avisa quando o valor cabe na dívida", () => {
    assert.equal(avisoDeValor(72500, -72500, "Bruno"), null);
    assert.equal(avisoDeValor(10000, -72500, "Bruno"), null);
  });

  it("avisa quando o valor passa da dívida, dizendo quanto ele deve", () => {
    assert.equal(
      avisoDeValor(80000, -72500, "Bruno"),
      `Bruno deve ${formatarReais(72500)}. Esse valor passa da dívida, e o pagamento vai ser registrado mesmo assim.`,
    );
  });

  it("avisa quando quem paga não deve nada", () => {
    assert.match(avisoDeValor(100, 160000, "Ana") ?? "", /Ana não está devendo nada/);
    assert.match(avisoDeValor(100, 0, "Ana") ?? "", /não está devendo nada/);
  });

  it("sem valor ou sem saldo carregado, não avisa", () => {
    assert.equal(avisoDeValor(null, -100, "Bruno"), null);
    assert.equal(avisoDeValor(100, undefined, "Bruno"), null);
  });
});
