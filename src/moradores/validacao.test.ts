import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao, ErroNaoEncontrado } from "../erros";
import { montaMorador, validaSaida } from "./validacao";

describe("montaMorador", () => {
  it("tira os espaços do nome e deixa o e-mail em minúsculas", () => {
    assert.deepEqual(montaMorador({ nome: "  Diego ", email: " Diego@Casa.com " }), {
      nome: "Diego",
      email: "diego@casa.com",
    });
  });

  it("recusa nome vazio, só com espaços ou ausente", () => {
    for (const nome of ["", "   ", undefined, null]) {
      assert.throws(
        () => montaMorador({ nome, email: "diego@casa.com" }),
        new ErroDeValidacao("Nome do morador é obrigatório."),
      );
    }
  });

  it("recusa e-mail vazio ou inválido", () => {
    assert.throws(
      () => montaMorador({ nome: "Diego", email: "" }),
      new ErroDeValidacao("E-mail é obrigatório."),
    );
    for (const email of ["diego", "diego@casa", "diego @casa.com", "@casa.com"]) {
      assert.throws(
        () => montaMorador({ nome: "Diego", email }),
        new ErroDeValidacao("E-mail inválido."),
      );
    }
  });
});

describe("validaSaida", () => {
  const CARLA = { id: 3, organizador: false, saiuEm: null };

  it("aceita um morador ativo que não é o organizador", () => {
    assert.deepEqual(validaSaida(CARLA), CARLA);
  });

  it("recusa o organizador, quem já saiu e quem não é da casa", () => {
    assert.throws(
      () => validaSaida({ ...CARLA, organizador: true }),
      new ErroDeValidacao("O organizador não pode marcar a própria saída."),
    );
    assert.throws(
      () => validaSaida({ ...CARLA, saiuEm: new Date("2026-09-28T00:00:00Z") }),
      new ErroDeValidacao("Este morador já saiu da casa."),
    );
    assert.throws(
      () => validaSaida(null),
      new ErroNaoEncontrado("Morador não encontrado nesta república."),
    );
  });
});
