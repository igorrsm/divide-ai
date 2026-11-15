import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { app } from "../app";
import { limpaBancoDeTeste } from "../testes/banco";
import { montaCasa } from "../testes/casa";

beforeEach(limpaBancoDeTeste);

describe("POST /api/republicas/:republicaId/convites", () => {
  it("o organizador gera um token de convite no formato UUID", async () => {
    const { republicaId, ids } = await montaCasa();

    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({ moradorId: ids.Ana });

    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    assert.match(
      resposta.body.token,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("quem não é organizador recebe 403 e nenhum convite é gerado", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);

    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({ moradorId: ids.Bruno });

    assert.equal(resposta.status, 403, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Só o organizador pode gerar convites/);
  });

  it("sem moradorId no corpo responde 400", async () => {
    const { republicaId } = await montaCasa();

    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({});

    assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Escolha quem você é/);
  });

  it("república inexistente responde 404", async () => {
    const resposta = await request(app)
      .post("/api/republicas/999/convites")
      .send({ moradorId: 1 });

    assert.equal(resposta.status, 404, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /República não encontrada/);
  });
});

describe("GET /api/convites/:token", () => {
  it("devolve os dados da república para o link de convite válido", async () => {
    const { republicaId, ids } = await montaCasa([], "República Aurora");
    const convite = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({ moradorId: ids.Ana });

    const resposta = await request(app).get(`/api/convites/${convite.body.token}`);

    assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
    assert.deepEqual(resposta.body, {
      republica: { id: republicaId, nome: "República Aurora" },
    });
  });

  it("token inexistente responde 404", async () => {
    const resposta = await request(app).get("/api/convites/token-inexistente");
    assert.equal(resposta.status, 404, JSON.stringify(resposta.body));
    assert.match(resposta.body.erro, /Convite não encontrado/);
  });
});

describe("POST /api/convites/:token", () => {
  it("usar convite cria o morador na república do convite e marca como usado", async () => {
    const { republicaId, ids } = await montaCasa();
    const convite = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({ moradorId: ids.Ana });

    const resposta = await request(app)
      .post(`/api/convites/${convite.body.token}`)
      .send({ nome: "  Bruno  ", email: "  Bruno@Exemplo.com  " });

    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    assert.deepEqual(resposta.body, {
      morador: { id: 2, nome: "Bruno" },
      republica: { id: republicaId, nome: "Casa Azul" },
    });

    const lista = await request(app).get(`/api/republicas/${republicaId}/moradores`);
    assert.equal(lista.status, 200);
    assert.deepEqual(lista.body, [
      { id: 1, nome: "Ana", email: "ana@casa-azul.exemplo", organizador: true, saiuEm: null },
      { id: 2, nome: "Bruno", email: "bruno@exemplo.com", organizador: false, saiuEm: null },
    ]);
  });

  it("uso único: usar o mesmo token de novo responde 400 e consulta posterior dá 400", async () => {
    const { republicaId, ids } = await montaCasa();
    const convite = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({ moradorId: ids.Ana });

    await request(app)
      .post(`/api/convites/${convite.body.token}`)
      .send({ nome: "Bruno", email: "bruno@exemplo.com" })
      .expect(201);

    const reuso = await request(app)
      .post(`/api/convites/${convite.body.token}`)
      .send({ nome: "Carla", email: "carla@exemplo.com" });

    assert.equal(reuso.status, 400, JSON.stringify(reuso.body));
    assert.match(reuso.body.erro, /Este convite já foi usado/);

    const consulta = await request(app).get(`/api/convites/${convite.body.token}`);
    assert.equal(consulta.status, 400, JSON.stringify(consulta.body));
    assert.match(consulta.body.erro, /Este convite já foi usado/);
  });

  it("e-mail repetido responde 400 e o convite continua valendo para outro uso", async () => {
    const { republicaId, ids } = await montaCasa();
    const convite = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({ moradorId: ids.Ana });

    const repetido = await request(app)
      .post(`/api/convites/${convite.body.token}`)
      .send({ nome: "Outra Ana", email: "ana@casa-azul.exemplo" });

    assert.equal(repetido.status, 400, JSON.stringify(repetido.body));
    assert.match(repetido.body.erro, /Já existe um morador com este e-mail/);

    const sucesso = await request(app)
      .post(`/api/convites/${convite.body.token}`)
      .send({ nome: "Bruno", email: "bruno@exemplo.com" });

    assert.equal(sucesso.status, 201, JSON.stringify(sucesso.body));
  });

  it("dados inválidos respondem 400", async () => {
    const { republicaId, ids } = await montaCasa();
    const convite = await request(app)
      .post(`/api/republicas/${republicaId}/convites`)
      .send({ moradorId: ids.Ana });

    const semNome = await request(app)
      .post(`/api/convites/${convite.body.token}`)
      .send({ nome: "  ", email: "bruno@exemplo.com" });
    assert.equal(semNome.status, 400);
    assert.match(semNome.body.erro, /Nome do morador é obrigatório/);

    const emailInvalido = await request(app)
      .post(`/api/convites/${convite.body.token}`)
      .send({ nome: "Bruno", email: "invalido" });
    assert.equal(emailInvalido.status, 400);
    assert.match(emailInvalido.body.erro, /E-mail inválido/);
  });
});

