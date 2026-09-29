import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SaldoMorador } from "./calculo";
import { sugerirTransferencias, type Transferencia } from "./transferencias";

/** Monta a lista de saldos a partir de { nome: centavos }, com ids 1, 2, 3... */
function saldos(valores: Record<string, number>): SaldoMorador[] {
  return Object.entries(valores).map(([nome, saldoCentavos], i) => ({
    moradorId: i + 1,
    nome,
    saldoCentavos,
    situacao: saldoCentavos > 0 ? "a receber" : saldoCentavos < 0 ? "a pagar" : "quitado",
  }));
}

/** Aplica os acertos como o saldo faz (D1): quem paga sobe, quem recebe desce. */
function aplicar(lista: SaldoMorador[], transferencias: Transferencia[]): number[] {
  const saldo = new Map(lista.map((s) => [s.moradorId, s.saldoCentavos]));
  for (const t of transferencias) {
    saldo.set(t.pagador.id, (saldo.get(t.pagador.id) ?? 0) + t.valorCentavos);
    saldo.set(t.recebedor.id, (saldo.get(t.recebedor.id) ?? 0) - t.valorCentavos);
  }
  return [...saldo.values()];
}

/** "Bruno → Ana: 72500", para comparar sem repetir os ids. */
function texto(transferencias: Transferencia[]): string[] {
  return transferencias.map((t) => `${t.pagador.nome} → ${t.recebedor.nome}: ${t.valorCentavos}`);
}

describe("sugerirTransferencias", () => {
  it("caso do seed: Bruno e Carla pagam à Ana", () => {
    const casa = saldos({ Ana: 160000, Bruno: -72500, Carla: -87500 });
    const sugestao = sugerirTransferencias(casa);
    assert.deepEqual(texto(sugestao), ["Carla → Ana: 87500", "Bruno → Ana: 72500"]);
    assert.ok(aplicar(casa, sugestao).every((s) => s === 0));
  });

  it("casa quitada: nenhuma transferência", () => {
    assert.deepEqual(sugerirTransferencias(saldos({ Ana: 0, Bruno: 0 })), []);
  });

  it("um devedor e dois credores", () => {
    const casa = saldos({ Ana: 3000, Bruno: 1000, Carla: -4000 });
    assert.deepEqual(texto(sugerirTransferencias(casa)), [
      "Carla → Ana: 3000",
      "Carla → Bruno: 1000",
    ]);
  });

  it("zera todos com no máximo N − 1 transferências, em centavos inteiros", () => {
    const casa = saldos({ A: 1234, B: -999, C: 501, D: -1, E: -735, F: 0 });
    const sugestao = sugerirTransferencias(casa);
    assert.ok(aplicar(casa, sugestao).every((s) => s === 0));
    assert.ok(sugestao.length <= 4, "5 moradores com saldo: no máximo 4 transferências");
    assert.ok(sugestao.every((t) => Number.isInteger(t.valorCentavos) && t.valorCentavos > 0));
  });

  it("no empate, vai primeiro o menor id, qualquer que seja a ordem da lista", () => {
    const casa = saldos({ Ana: 500, Bruno: 500, Carla: -500, Davi: -500 });
    const esperado = ["Carla → Ana: 500", "Davi → Bruno: 500"];
    assert.deepEqual(texto(sugerirTransferencias(casa)), esperado);
    assert.deepEqual(texto(sugerirTransferencias([...casa].reverse())), esperado);
  });
});
