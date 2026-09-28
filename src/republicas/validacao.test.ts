import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErroDeValidacao } from "../erros";
import {
  interpretaEmail,
  interpretaNomeOrganizador,
  interpretaNomeRepublica,
} from "./validacao";

describe("interpretaNomeRepublica", () => {
  it("aceita nome válido e remove espaços nas pontas", () => {
    assert.equal(interpretaNomeRepublica("República Solar"), "República Solar");
    assert.equal(interpretaNomeRepublica("  Casa Amarela  "), "Casa Amarela");
  });

  it("recusa nome vazio ou apenas com espaços", () => {
    assert.throws(
      () => interpretaNomeRepublica(""),
      new ErroDeValidacao("Nome da república é obrigatório."),
    );
    assert.throws(
      () => interpretaNomeRepublica("   "),
      new ErroDeValidacao("Nome da república é obrigatório."),
    );
  });

  it("recusa valor que não é texto", () => {
    assert.throws(
      () => interpretaNomeRepublica(null),
      new ErroDeValidacao("Nome da república é obrigatório."),
    );
    assert.throws(
      () => interpretaNomeRepublica(undefined),
      new ErroDeValidacao("Nome da república é obrigatório."),
    );
  });
});

describe("interpretaNomeOrganizador", () => {
  it("aceita nome válido e remove espaços nas pontas", () => {
    assert.equal(interpretaNomeOrganizador("Eduardo"), "Eduardo");
    assert.equal(interpretaNomeOrganizador("  Lucas Resende  "), "Lucas Resende");
  });

  it("recusa nome vazio ou apenas com espaços", () => {
    assert.throws(
      () => interpretaNomeOrganizador(""),
      new ErroDeValidacao("Nome do organizador é obrigatório."),
    );
    assert.throws(
      () => interpretaNomeOrganizador("   "),
      new ErroDeValidacao("Nome do organizador é obrigatório."),
    );
  });
});

describe("interpretaEmail", () => {
  it("aceita e-mail válido e converte para minúsculas", () => {
    assert.equal(interpretaEmail("edu@exemplo.com"), "edu@exemplo.com");
    assert.equal(interpretaEmail("  Lucas@Exemplo.COM  "), "lucas@exemplo.com");
  });

  it("recusa e-mail vazio ou apenas espaços", () => {
    assert.throws(
      () => interpretaEmail(""),
      new ErroDeValidacao("E-mail é obrigatório."),
    );
    assert.throws(
      () => interpretaEmail("   "),
      new ErroDeValidacao("E-mail é obrigatório."),
    );
  });

  it("recusa e-mail com formato inválido", () => {
    assert.throws(
      () => interpretaEmail("invalido"),
      new ErroDeValidacao("E-mail inválido."),
    );
    assert.throws(
      () => interpretaEmail("semdominio@"),
      new ErroDeValidacao("E-mail inválido."),
    );
    assert.throws(
      () => interpretaEmail("sem@ponto"),
      new ErroDeValidacao("E-mail inválido."),
    );
  });
});
