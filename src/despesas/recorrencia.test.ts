import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao } from "../erros";
import { diaDoMesDa, interpretaRecorrente } from "./recorrencia";

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
