import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao } from "../erros";
import { montaMorador } from "./validacao";

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
