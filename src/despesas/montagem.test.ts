import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao } from "../erros";
import { montaDespesa } from "./montagem";

const HOJE = new Date("2026-09-23T14:00:00.000Z");
const CASA = [1, 2, 3];
const ENTRADA = { descricao: " Luz ", valor: "100,00", data: "2026-09-20", pagadorId: 1 };

describe("montaDespesa", () => {
  it("valida os campos e rateia entre todos quando não há escolha", () => {
    const despesa = montaDespesa(ENTRADA, CASA, HOJE);
    assert.equal(despesa.descricao, "Luz");
    assert.equal(despesa.valorCentavos, 10000);
    assert.equal(despesa.data.toISOString(), "2026-09-20T00:00:00.000Z");
    assert.equal(despesa.pagadorId, 1);
    assert.deepEqual(
      despesa.participacoes.map((p) => p.valorCentavos),
      [3334, 3333, 3333],
    );
  });

  it("rateia só entre os participantes escolhidos", () => {
    const despesa = montaDespesa({ ...ENTRADA, participantesIds: [2, 3] }, CASA, HOJE);
    assert.deepEqual(despesa.participacoes, [
      { moradorId: 2, valorCentavos: 5000 },
      { moradorId: 3, valorCentavos: 5000 },
    ]);
  });

  it("recusa quem pagou de fora da casa", () => {
    assert.throws(() => montaDespesa({ ...ENTRADA, pagadorId: 9 }, CASA, HOJE), ErroDeValidacao);
  });

  it("recusa campo obrigatório ausente", () => {
    assert.throws(() => montaDespesa({ ...ENTRADA, descricao: undefined }, CASA, HOJE), ErroDeValidacao);
    assert.throws(() => montaDespesa({ ...ENTRADA, valor: undefined }, CASA, HOJE), ErroDeValidacao);
  });
});
