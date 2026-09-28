import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diaDa } from "./dia";
import { interpretaData } from "./validacao";

const HOJE = new Date("2026-09-23T14:00:00.000Z");

describe("diaDa", () => {
  it("devolve o dia de uma data gravada à meia-noite UTC", () => {
    assert.equal(diaDa(new Date("2026-09-05T00:00:00.000Z")), "2026-09-05");
  });

  it("volta o mesmo dia que a pessoa escolheu no formulário", () => {
    // Fixa o acoplamento com interpretaData: se a gravação deixar de ser à
    // meia-noite UTC, este teste quebra em vez de a lista mostrar outro dia.
    for (const dia of ["2026-01-01", "2026-09-05", "2026-09-23", "2024-02-29"]) {
      assert.equal(diaDa(interpretaData(dia, HOJE)), dia);
    }
  });
});
