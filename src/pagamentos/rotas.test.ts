import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { app } from "../app";
import { limpaBancoDeTeste } from "../testes/banco";
import { DATA, lanca, montaCasa, porNome, saldos } from "../testes/casa";

// Integração da D3: rota → serviço → test.db, sem mock.
beforeEach(limpaBancoDeTeste);

function registra(republicaId: number, acerto: Record<string, unknown>) {
  return request(app).post(`/api/republicas/${republicaId}/pagamentos`).send(acerto);
}

async function lista(republicaId: number) {
  const resposta = await request(app).get(`/api/republicas/${republicaId}/pagamentos`);
  assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
  return resposta.body;
}

describe("POST /api/republicas/:id/pagamentos", () => {
  it("grava o acerto em centavos e devolve a data como AAAA-MM-DD", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);

    const resposta = await registra(republicaId, {
      pagadorId: ids.Bruno,
      recebedorId: ids.Ana,
      valor: "725,50",
      data: DATA,
    });

    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    assert.deepEqual(resposta.body, {
      id: 1,
      republicaId,
      pagadorId: ids.Bruno,
      recebedorId: ids.Ana,
      valorCentavos: 72550,
      data: DATA,
    });
  });

  it("pagar a dívida inteira tira a dívida do saldo dos dois", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    // Aluguel de R$ 2.400,00 da Ana entre os três: Bruno e Carla devem R$ 800,00.
    await lanca(republicaId, { valor: "2400,00", pagadorId: ids.Ana });

    await registra(republicaId, { pagadorId: ids.Bruno, recebedorId: ids.Ana, valor: "800", data: DATA }).expect(201);

    assert.deepEqual(porNome(await saldos(republicaId)), { Ana: 80000, Bruno: 0, Carla: -80000 });
  });

  it("aceita valor maior que a dívida: quem pagou a mais passa a ter a receber", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);
    await lanca(republicaId, { valor: "100,00", pagadorId: ids.Ana });

    await registra(republicaId, { pagadorId: ids.Bruno, recebedorId: ids.Ana, valor: "80,00", data: DATA }).expect(201);

    assert.deepEqual(porNome(await saldos(republicaId)), { Ana: -3000, Bruno: 3000 });
  });
});
