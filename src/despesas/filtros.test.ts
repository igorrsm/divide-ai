import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpretaFiltros } from "./filtros";

const CASA = [1, 2, 3];

describe("interpretaFiltros", () => {
  it("sem parâmetros, não filtra nada", () => {
    assert.deepEqual(interpretaFiltros({}, CASA), {});
    assert.deepEqual(interpretaFiltros({ de: "", ate: "", moradorId: "" }, CASA), {});
  });

  it("o período inclui o dia final inteiro", () => {
    const filtros = interpretaFiltros({ de: "2026-09-01", ate: "2026-09-10" }, CASA);
    assert.equal(filtros.desde?.toISOString(), "2026-09-01T00:00:00.000Z");
    assert.equal(filtros.antesDe?.toISOString(), "2026-09-11T00:00:00.000Z");
  });

  it("aceita só um lado do período, e o mesmo dia nos dois", () => {
    assert.ok(interpretaFiltros({ de: "2026-09-05" }, CASA).desde);
    assert.ok(interpretaFiltros({ ate: "2026-12-31" }, CASA).antesDe);
    assert.doesNotThrow(() => interpretaFiltros({ de: "2026-09-05", ate: "2026-09-05" }, CASA));
  });

  it("recusa data inválida ou inexistente", () => {
    for (const de of ["05/09/2026", "2026-02-30", "abc", ["2026-09-01"]]) {
      assert.throws(() => interpretaFiltros({ de }, CASA), /inválid/);
    }
  });

  it("recusa início depois do fim", () => {
    assert.throws(
      () => interpretaFiltros({ de: "2026-09-10", ate: "2026-09-01" }, CASA),
      /não pode ser depois/,
    );
  });

  it("aceita morador da casa, vindo como texto", () => {
    assert.equal(interpretaFiltros({ moradorId: "2" }, CASA).moradorId, 2);
  });

  it("recusa morador de outra casa ou id inválido", () => {
    assert.throws(() => interpretaFiltros({ moradorId: "9" }, CASA), /não é desta república/);
    assert.throws(() => interpretaFiltros({ moradorId: "abc" }, CASA), /Morador inválido/);
  });
});
