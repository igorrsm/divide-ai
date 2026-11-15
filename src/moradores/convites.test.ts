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
