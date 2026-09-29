import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao } from "../erros";
import {
  diaDoMesDa,
  interpretaRecorrente,
  lancamentosDoMes,
  type ModeloRecorrente,
} from "./recorrencia";

describe("interpretaRecorrente", () => {
  it("aceita o booleano e o texto do formulário", () => {
    assert.equal(interpretaRecorrente(true), true);
    assert.equal(interpretaRecorrente("true"), true);
    assert.equal(interpretaRecorrente(false), false);
    assert.equal(interpretaRecorrente("false"), false);
  });

  it("ausente não decide nada", () => {
    for (const entrada of [undefined, null, ""]) {
      assert.equal(interpretaRecorrente(entrada), undefined);
    }
  });

  it("recusa qualquer outro valor", () => {
    for (const entrada of ["sim", 1, {}]) {
      assert.throws(
        () => interpretaRecorrente(entrada),
        new ErroDeValidacao("Recorrente precisa ser verdadeiro ou falso."),
      );
    }
  });
});

describe("diaDoMesDa", () => {
  it("usa o dia da data gravada à meia-noite UTC, sem o fuso mudar o dia", () => {
    assert.equal(diaDoMesDa(new Date("2026-09-05T00:00:00Z")), 5);
    assert.equal(diaDoMesDa(new Date("2026-08-31T00:00:00Z")), 31);
    assert.equal(diaDoMesDa(new Date("2026-09-01T00:00:00Z")), 1);
  });
});

describe("lancamentosDoMes", () => {
  // 28/09/2026, meio-dia em São Paulo.
  const AGORA = new Date("2026-09-28T15:00:00Z");
  const ALUGUEL: ModeloRecorrente = {
    id: 1,
    data: new Date("2026-08-05T00:00:00Z"),
    diaDoMes: 5,
    ativa: true,
    ultimaGeracao: null,
  };
  const dias = (mes: string, modelos: ModeloRecorrente[], agora = AGORA) =>
    lancamentosDoMes(mes, modelos, agora).map((l) => l.data.toISOString().slice(0, 10));

  it("gera no dia da recorrência do mês pedido", () => {
    assert.deepEqual(lancamentosDoMes("2026-09", [ALUGUEL], AGORA), [
      { modeloId: 1, data: new Date("2026-09-05T00:00:00Z") },
    ]);
  });

  it("gerar de novo o mesmo mês não duplica", () => {
    const jaGerado = { ...ALUGUEL, ultimaGeracao: new Date("2026-09-01T00:00:00Z") };
    assert.deepEqual(dias("2026-09", [jaGerado]), []);
  });

  it("dia 31 cai no último dia dos meses mais curtos", () => {
    const dia31 = { ...ALUGUEL, data: new Date("2025-12-31T00:00:00Z"), diaDoMes: 31 };
    const depois = new Date("2028-03-10T15:00:00Z");
    assert.deepEqual(dias("2026-02", [dia31], depois), ["2026-02-28"]);
    assert.deepEqual(dias("2028-02", [dia31], depois), ["2028-02-29"]);
    assert.deepEqual(dias("2026-04", [dia31], depois), ["2026-04-30"]);
  });

  it("recorrência parada e o mês do próprio modelo não geram", () => {
    assert.deepEqual(dias("2026-09", [{ ...ALUGUEL, ativa: false }]), []);
    assert.deepEqual(dias("2026-08", [ALUGUEL]), []);
  });

  it("no mês atual, o dia que ainda não chegou fica para depois", () => {
    const dia30 = { ...ALUGUEL, id: 2, diaDoMes: 30 };
    assert.deepEqual(dias("2026-09", [ALUGUEL, dia30]), ["2026-09-05"]);
  });

  it("recusa gerar um mês que ainda não começou", () => {
    assert.throws(
      () => lancamentosDoMes("2026-10", [ALUGUEL], AGORA),
      new ErroDeValidacao("Não dá para gerar lançamentos de um mês que ainda não começou."),
    );
  });
});
