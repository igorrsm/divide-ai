import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao } from "../erros";
import { ratearIgualmente } from "./rateio";

const ANA = 1;
const BRUNO = 2;
const CARLA = 3;
const CASA = [ANA, BRUNO, CARLA];

/** Valores em centavos, na ordem em que a função devolveu. */
function valores(valorCentavos: number, ids: number[], pagadorId: number): number[] {
  const rateio = ratearIgualmente(valorCentavos, ids, pagadorId);
  const soma = rateio.reduce((total, p) => total + p.valorCentavos, 0);
  assert.equal(soma, valorCentavos, "a soma das participações deve bater com o valor");
  return rateio.map((p) => p.valorCentavos);
}

describe("ratearIgualmente", () => {
  it("R$ 100,00 entre 3 moradores dá 33,34 / 33,33 / 33,33", () => {
    // O critério da história, com a Ana pagando: 10000 = 3333 × 3 + 1.
    assert.deepEqual(valores(10000, CASA, ANA), [3334, 3333, 3333]);
  });

  it("a sobra fica com quem pagou, em qualquer posição da lista", () => {
    assert.deepEqual(valores(10000, CASA, BRUNO), [3333, 3334, 3333]);
    assert.deepEqual(valores(10000, CASA, CARLA), [3333, 3333, 3334]);
  });

  it("desmarcar um morador redistribui o valor entre os restantes", () => {
    // O critério 2 da B4: os mesmos R$ 100,00, com menos gente participando.
    assert.deepEqual(valores(10000, CASA, ANA), [3334, 3333, 3333]);
    assert.deepEqual(valores(10000, [ANA, BRUNO], ANA), [5000, 5000]);
    assert.deepEqual(valores(10000, [ANA], ANA), [10000]);
    // E quem saiu do rateio não recebe participação nenhuma.
    assert.deepEqual(
      ratearIgualmente(10000, [ANA, BRUNO], ANA).map((p) => p.moradorId),
      [ANA, BRUNO],
    );
  });

  it("divisão exata não deixa sobra", () => {
    assert.deepEqual(valores(240000, CASA, ANA), [80000, 80000, 80000]);
    assert.deepEqual(valores(15000, [BRUNO, CARLA], BRUNO), [7500, 7500]);
  });

  it("a soma bate com o valor em qualquer tamanho de casa", () => {
    for (let participantes = 1; participantes <= 9; participantes++) {
      const ids = Array.from({ length: participantes }, (_, i) => i + 1);
      for (const valor of [1, 2, 7, 99, 100, 10000, 10001, 123457, 999999]) {
        // O próprio helper já confere a soma.
        valores(valor, ids, ids[0]);
      }
    }
  });

  it("exatamente um participante recebe acima da base: a sobra não é espalhada", () => {
    // 10002 entre 4: base 2500, sobra 2. Um leva 2502, os outros 2500.
    const rateio = valores(10002, [ANA, BRUNO, CARLA, 4], ANA);
    assert.deepEqual(rateio, [2502, 2500, 2500, 2500]);
  });

  it("pagador fora do rateio: a sobra vai para o menor id, mesmo desordenado", () => {
    // Carla (id 3) paga R$ 100,01 entre os ids 12, 5 e 9: 10001 = 3333 × 3 + 2.
    // O menor id é o 5, e não o primeiro da lista.
    const rateio = ratearIgualmente(10001, [12, 5, 9], CARLA);
    assert.deepEqual(rateio, [
      { moradorId: 12, valorCentavos: 3333 },
      { moradorId: 5, valorCentavos: 3335 },
      { moradorId: 9, valorCentavos: 3333 },
    ]);
  });

  it("não cria participação para quem não participa", () => {
    const rateio = ratearIgualmente(10001, [ANA, BRUNO], CARLA);
    assert.deepEqual(
      rateio.map((p) => p.moradorId),
      [ANA, BRUNO],
    );
  });

  it("participante único leva o valor inteiro", () => {
    assert.deepEqual(valores(777, [ANA], ANA), [777]);
  });

  it("id repetido não vira participação duplicada", () => {
    assert.deepEqual(valores(10000, [ANA, BRUNO, ANA, CARLA], ANA), [3334, 3333, 3333]);
  });

  it("valor menor que o número de participantes: quem pagou leva os centavos", () => {
    assert.deepEqual(valores(2, CASA, ANA), [2, 0, 0]);
  });

  it("recusa lista de participantes vazia", () => {
    assert.throws(() => ratearIgualmente(10000, [], ANA), ErroDeValidacao);
  });

  it("recusa valor que não é inteiro positivo de centavos", () => {
    assert.throws(() => ratearIgualmente(0, CASA, ANA), ErroDeValidacao);
    assert.throws(() => ratearIgualmente(-100, CASA, ANA), ErroDeValidacao);
    assert.throws(() => ratearIgualmente(33.5, CASA, ANA), ErroDeValidacao);
  });
});
