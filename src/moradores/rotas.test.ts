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

  it("e-mail repetido na mesma casa ou em outra responde 400", async () => {
    const azul = await montaCasa([], "Casa Azul", "Ana");
    await montaCasa([], "Casa Verde", "Duda");

    const mesmaCasa = await request(app)
      .post(`/api/republicas/${azul.republicaId}/moradores`)
      .send({ moradorId: azul.ids.Ana, nome: "Outra Ana", email: "ana@casa-azul.exemplo" });
    assert.equal(mesmaCasa.status, 400);
    assert.match(mesmaCasa.body.erro, /Já existe um morador com este e-mail/);

    const outraCasa = await request(app)
      .post(`/api/republicas/${azul.republicaId}/moradores`)
      .send({ moradorId: azul.ids.Ana, nome: "Duda Clone", email: "duda@casa-verde.exemplo" });
    assert.equal(outraCasa.status, 400);
    assert.match(outraCasa.body.erro, /Já existe um morador com este e-mail/);
  });

  it("república inexistente responde 404 e id inválido responde 400", async () => {
    const resposta404 = await request(app)
      .post("/api/republicas/999/moradores")
      .send({ moradorId: 1, nome: "Bruno", email: "bruno@exemplo.com" });
    assert.equal(resposta404.status, 404);

    const resposta400 = await request(app)
      .post("/api/republicas/abc/moradores")
      .send({ moradorId: 1, nome: "Bruno", email: "bruno@exemplo.com" });
    assert.equal(resposta400.status, 400);
  });
});

describe("DELETE /api/republicas/:republicaId/moradores/:alvoId", () => {
  it("o organizador marca a saída e a data aparece no formato AAAA-MM-DD", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);

    const resposta = await request(app)
      .delete(`/api/republicas/${republicaId}/moradores/${ids.Bruno}`)
      .send({ moradorId: ids.Ana });

    assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
    assert.equal(resposta.body.id, ids.Bruno);
    assert.match(resposta.body.saiuEm, /^\d{4}-\d{2}-\d{2}$/);

    const moradores = (await request(app).get(`/api/republicas/${republicaId}/moradores`)).body;
    const bruno = moradores.find((m: { id: number }) => m.id === ids.Bruno);
    assert.ok(bruno?.saiuEm, "saiuEm deve aparecer na listagem");
  });

  it("quem não é organizador recebe 403", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);

    const resposta = await request(app)
      .delete(`/api/republicas/${republicaId}/moradores/${ids.Ana}`)
      .send({ moradorId: ids.Bruno });

    assert.equal(resposta.status, 403, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Só o organizador pode marcar a saída/);
  });

  it("organizador não pode marcar a própria saída: 400", async () => {
    const { republicaId, ids } = await montaCasa();

    const resposta = await request(app)
      .delete(`/api/republicas/${republicaId}/moradores/${ids.Ana}`)
      .send({ moradorId: ids.Ana });

    assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /O organizador não pode marcar a própria saída/);
  });

  it("marcar de novo quem já saiu responde 400", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);
    await request(app)
      .delete(`/api/republicas/${republicaId}/moradores/${ids.Bruno}`)
      .send({ moradorId: ids.Ana });

    const resposta = await request(app)
      .delete(`/api/republicas/${republicaId}/moradores/${ids.Bruno}`)
      .send({ moradorId: ids.Ana });

    assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Este morador já saiu da casa/);
  });

  it("alvo de outra casa ou inexistente responde 404", async () => {
    const azul = await montaCasa([], "Casa Azul", "Ana");
    const verde = await montaCasa(["Bruno"], "Casa Verde", "Duda");

    const outraCasa = await request(app)
      .delete(`/api/republicas/${azul.republicaId}/moradores/${verde.ids.Bruno}`)
      .send({ moradorId: azul.ids.Ana });
    assert.equal(outraCasa.status, 404);
    assert.match(outraCasa.body.erro, /Morador não encontrado nesta república/);

    const inexistente = await request(app)
      .delete(`/api/republicas/${azul.republicaId}/moradores/999`)
      .send({ moradorId: azul.ids.Ana });
    assert.equal(inexistente.status, 404);
  });

  it("id do alvo não é número responde 400", async () => {
    const { republicaId, ids } = await montaCasa();

    const resposta = await request(app)
      .delete(`/api/republicas/${republicaId}/moradores/abc`)
      .send({ moradorId: ids.Ana });

    assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
  });
});
