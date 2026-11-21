import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../db";
import { limpaBancoDeTeste } from "../testes/banco";
import { montaCasa } from "../testes/casa";

beforeEach(limpaBancoDeTeste);

describe("POST /api/republicas/:republicaId/moradores", () => {
  it("o organizador adiciona um morador com dados normalizados", async () => {
    const { republicaId, ids } = await montaCasa();

    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/moradores`)
      .send({ moradorId: ids.Ana, nome: "  Bruno  ", email: "  Bruno@Exemplo.com  " });

    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    assert.deepEqual(resposta.body, {
      id: 2,
      nome: "Bruno",
      email: "bruno@exemplo.com",
      organizador: false,
    });

    const moradores = (await request(app).get(`/api/republicas/${republicaId}/moradores`)).body;
    assert.equal(moradores.length, 2);
    assert.equal(moradores[1].email, "bruno@exemplo.com");
  });

  it("quem não é organizador recebe 403 e ninguém é adicionado", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);

    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/moradores`)
      .send({ moradorId: ids.Bruno, nome: "Carla", email: "carla@exemplo.com" });

    assert.equal(resposta.status, 403, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Só o organizador pode adicionar moradores/);
    assert.equal(await prisma.morador.count({ where: { republicaId } }), 2);
  });

  it("moradorId de outra república recebe 403", async () => {
    const azul = await montaCasa([], "Casa Azul", "Ana");
    const verde = await montaCasa([], "Casa Verde", "Duda");

    const resposta = await request(app)
      .post(`/api/republicas/${azul.republicaId}/moradores`)
      .send({ moradorId: verde.ids.Duda, nome: "Bruno", email: "bruno@exemplo.com" });

    assert.equal(resposta.status, 403, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Só o organizador pode adicionar moradores/);
  });

  it("sem moradorId responde 400 pedindo para escolher em Quem é você", async () => {
    const { republicaId } = await montaCasa();

    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/moradores`)
      .send({ nome: "Bruno", email: "bruno@exemplo.com" });

    assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Escolha quem você é em "Quem é você\?"/);
  });

  it("nome vazio ou e-mail inválido responde 400", async () => {
    const { republicaId, ids } = await montaCasa();

    const semNome = await request(app)
      .post(`/api/republicas/${republicaId}/moradores`)
      .send({ moradorId: ids.Ana, nome: "   ", email: "bruno@exemplo.com" });
    assert.equal(semNome.status, 400);
    assert.match(semNome.body.erro, /Nome do morador é obrigatório/);

    const emailInvalido = await request(app)
      .post(`/api/republicas/${republicaId}/moradores`)
      .send({ moradorId: ids.Ana, nome: "Bruno", email: "invalido" });
    assert.equal(emailInvalido.status, 400);
    assert.match(emailInvalido.body.erro, /E-mail inválido/);
  });
});
