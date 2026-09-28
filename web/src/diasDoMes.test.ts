import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { diasDoMes } from "./diasDoMes";

/** Quantas casas vazias antes do dia 1º, ou seja, o dia da semana dele. */
function vazios(mes: string): number {
  return diasDoMes(mes).filter((dia) => dia === null).length;
}

describe("diasDoMes", () => {
  it("começa no dia da semana certo", () => {
    assert.equal(vazios("2026-09"), 2); // 1º/09/2026 é terça
    assert.equal(vazios("2026-02"), 0); // 1º/02/2026 é domingo
    assert.equal(vazios("2027-01"), 5); // 1º/01/2027 é sexta
    assert.equal(vazios("2000-01"), 6); // 1º/01/2000 é sábado
  });

  it("tem o número certo de dias, com fevereiro bissexto", () => {
    const dias = (mes: string) => diasDoMes(mes).filter((dia) => dia !== null).length;
    assert.equal(dias("2026-09"), 30);
    assert.equal(dias("2026-12"), 31);
    assert.equal(dias("2026-02"), 28);
    assert.equal(dias("2028-02"), 29);
    assert.equal(dias("2100-02"), 28);
    assert.equal(dias("2000-02"), 29);
  });

  it("escreve cada dia como AAAA-MM-DD", () => {
    const grade = diasDoMes("2026-09");
    assert.equal(grade[2], "2026-09-01");
    assert.equal(grade.at(-1), "2026-09-30");
  });
});
