import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

/** Os .ts de src, fora os testes e o cliente gerado do Prisma. */
function arquivos(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = join(pasta, item.name);
    if (item.isDirectory()) return item.name === "generated" ? [] : arquivos(caminho);
    return item.name.endsWith(".ts") && !item.name.endsWith(".test.ts") ? [caminho] : [];
  });
}

// Leituras de despesa; create e update não entram, porque não listam nada.
const LEITURA = /prisma\.despesa\.(findMany|findFirst|findUnique|count|aggregate|groupBy)\(/g;

describe("DESPESA_ATIVA", () => {
  it("toda leitura de despesa filtra a excluída (B6)", () => {
    const esquecidas: string[] = [];
    for (const arquivo of arquivos("src")) {
      const codigo = readFileSync(arquivo, "utf8");
      for (const achado of codigo.matchAll(LEITURA)) {
        // O where fica logo no começo da chamada.
        const trecho = codigo.slice(achado.index, achado.index + 400);
        if (!trecho.includes("DESPESA_ATIVA")) {
          const linha = codigo.slice(0, achado.index).split("\n").length;
          esquecidas.push(`${arquivo}:${linha}`);
        }
      }
    }
    assert.deepEqual(esquecidas, [], "Use ...DESPESA_ATIVA no where destas consultas");
  });
});
