import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao } from "../erros";
import {
  interpretaData,
  interpretaDescricao,
  interpretaId,
  reaisParaCentavos,
} from "./validacao";

const HOJE = new Date("2026-09-23T14:00:00.000Z");

describe("reaisParaCentavos", () => {
  it("converte as formas que o formulário produz", () => {
    assert.equal(reaisParaCentavos("150"), 15000);
    assert.equal(reaisParaCentavos("150,00"), 15000);
    assert.equal(reaisParaCentavos("150.5"), 15050);
    assert.equal(reaisParaCentavos(" 0,01 "), 1);
  });

  it("não perde centavo onde o ponto flutuante perderia", () => {
    // 19.99 * 100 = 1998.9999999999998 em ponto flutuante.
    assert.equal(reaisParaCentavos("19,99"), 1999);
    assert.equal(reaisParaCentavos("1234,56"), 123456);
  });

  it("recusa valor zero ou negativo", () => {
    assert.throws(() => reaisParaCentavos("0"), ErroDeValidacao);
    assert.throws(() => reaisParaCentavos("0,00"), ErroDeValidacao);
    assert.throws(() => reaisParaCentavos("-5"), ErroDeValidacao);
  });

  it("recusa texto que não é um valor", () => {
    assert.throws(() => reaisParaCentavos("abc"), ErroDeValidacao);
    assert.throws(() => reaisParaCentavos(""), ErroDeValidacao);
    assert.throws(() => reaisParaCentavos("10,999"), ErroDeValidacao);
    // Separador de milhar é ambíguo e fica de fora de propósito.
    assert.throws(() => reaisParaCentavos("1.234,56"), ErroDeValidacao);
  });
});

describe("interpretaData", () => {
  it("aceita hoje e o passado", () => {
    assert.equal(interpretaData("2026-09-23", HOJE).toISOString(), "2026-09-23T00:00:00.000Z");
    assert.equal(interpretaData("2026-01-01", HOJE).toISOString(), "2026-01-01T00:00:00.000Z");
  });

  it("recusa data futura", () => {
    assert.throws(() => interpretaData("2026-09-24", HOJE), ErroDeValidacao);
  });

  it("decide o futuro pelo calendário de São Paulo, não pelo UTC", () => {
    // 01:00 UTC do dia 24 ainda são 22:00 do dia 23 em São Paulo.
    const noiteBrasileira = new Date("2026-09-24T01:00:00.000Z");
    assert.equal(
      interpretaData("2026-09-23", noiteBrasileira).toISOString(),
      "2026-09-23T00:00:00.000Z",
    );
    assert.throws(() => interpretaData("2026-09-24", noiteBrasileira), ErroDeValidacao);
  });

  it("recusa data que não existe no calendário", () => {
    // O JavaScript aceitaria e deslizaria para 2 de março.
    assert.throws(() => interpretaData("2026-02-30", HOJE), ErroDeValidacao);
    assert.throws(() => interpretaData("2026-13-01", HOJE), ErroDeValidacao);
  });

  it("recusa formato diferente de AAAA-MM-DD", () => {
    assert.throws(() => interpretaData("23/09/2026", HOJE), ErroDeValidacao);
  });
});

describe("interpretaDescricao", () => {
  it("remove espaços das pontas", () => {
    assert.equal(interpretaDescricao("  Conta de luz  "), "Conta de luz");
  });

  it("recusa descrição vazia", () => {
    assert.throws(() => interpretaDescricao("   "), ErroDeValidacao);
  });
});

describe("interpretaId", () => {
  it("aceita id vindo como texto do formulário", () => {
    assert.equal(interpretaId("3", "Morador"), 3);
  });

  it("recusa id que não é inteiro positivo", () => {
    assert.throws(() => interpretaId("0", "Morador"), ErroDeValidacao);
    assert.throws(() => interpretaId("1.5", "Morador"), ErroDeValidacao);
    assert.throws(() => interpretaId("abc", "Morador"), ErroDeValidacao);
  });
});
