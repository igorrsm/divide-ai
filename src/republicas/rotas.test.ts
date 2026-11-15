import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../db";
import { limpaBancoDeTeste } from "../testes/banco";

beforeEach(limpaBancoDeTeste);

describe("POST /api/republicas", () => {
  it("cria a república e o organizador em transação, com dados normalizados", async () => {
    const resposta = await request(app).post("/api/republicas").send({
      nome: "  República Solar  ",
      nomeOrganizador: "  Eduardo  ",
      emailOrganizador: "  Eduardo@Solar.Exemplo  ",
    });

    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    assert.equal(resposta.body.id, 1);
    assert.equal(resposta.body.nome, "República Solar");
    assert.ok(resposta.body.criadaEm);
    assert.deepEqual(resposta.body.moradores, [
      { id: 1, nome: "Eduardo", email: "eduardo@solar.exemplo", organizador: true },
    ]);

    const rep = await request(app).get(`/api/republicas/${resposta.body.id}`);
    assert.equal(rep.status, 200);
    assert.equal(rep.body.nome, "República Solar");

    const mor = await request(app).get(`/api/republicas/${resposta.body.id}/moradores`);
    assert.equal(mor.status, 200);
    assert.equal(mor.body.length, 1);
    assert.equal(mor.body[0].email, "eduardo@solar.exemplo");
  });

  const invalidos: [string, Record<string, unknown>, RegExp][] = [
    ["sem nome da república", { nomeOrganizador: "Ana", emailOrganizador: "ana@exemplo.com" }, /Nome da república é obrigatório/],
    ["nome da república com espaços", { nome: "   ", nomeOrganizador: "Ana", emailOrganizador: "ana@exemplo.com" }, /Nome da república é obrigatório/],
    ["sem nome do organizador", { nome: "Casa", emailOrganizador: "ana@exemplo.com" }, /Nome do organizador é obrigatório/],
    ["nome do organizador com espaços", { nome: "Casa", nomeOrganizador: "  ", emailOrganizador: "ana@exemplo.com" }, /Nome do organizador é obrigatório/],
    ["sem e-mail", { nome: "Casa", nomeOrganizador: "Ana" }, /E-mail é obrigatório/],
    ["e-mail vazio", { nome: "Casa", nomeOrganizador: "Ana", emailOrganizador: "  " }, /E-mail é obrigatório/],
    ["e-mail inválido", { nome: "Casa", nomeOrganizador: "Ana", emailOrganizador: "invalido" }, /E-mail inválido/],
    ["corpo vazio", {}, /Nome da república é obrigatório/],
  ];

  for (const [nome, corpo, mensagem] of invalidos) {
    it(`entrada inválida (${nome}): responde 400 e não cria nada`, async () => {
      const resposta = await request(app).post("/api/republicas").send(corpo);
      assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
      assert.match(resposta.body.erro, mensagem);
      assert.equal(await prisma.republica.count(), 0);
      assert.equal(await prisma.morador.count(), 0);
    });
  }

  it("e-mail repetido de outra república responde 400 e não cria república", async () => {
    await request(app).post("/api/republicas").send({
      nome: "Primeira Casa",
      nomeOrganizador: "Ana",
      emailOrganizador: "ana@exemplo.com",
    }).expect(201);

    const resposta = await request(app).post("/api/republicas").send({
      nome: "Segunda Casa",
      nomeOrganizador: "Outra Ana",
      emailOrganizador: "ana@exemplo.com",
    });

    assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Já existe um morador com este e-mail/);
    assert.equal(await prisma.republica.count(), 1);
  });
});
