import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { app } from "../app";
import { limpaBancoDeTeste } from "../testes/banco";

// Integração da D1/D5: rota → serviço → test.db, sem mock. Os dados entram
// pela própria API, como a tela faz.
beforeEach(limpaBancoDeTeste);

const DATA = "2026-10-01";

/** Cria a casa com a Ana (organizadora, id 1) e os outros moradores, em ordem. */
async function montaCasa(...outros: string[]) {
  const criada = await request(app).post("/api/republicas").send({
    nome: "Casa Azul",
    nomeOrganizador: "Ana",
    emailOrganizador: "ana@exemplo.com",
  });
  assert.equal(criada.status, 201, JSON.stringify(criada.body));
  const republicaId: number = criada.body.id;
  const ids: Record<string, number> = { Ana: criada.body.moradores[0].id };
  for (const nome of outros) {
    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/moradores`)
      .send({ moradorId: ids.Ana, nome, email: `${nome.toLowerCase()}@exemplo.com` });
    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    ids[nome] = resposta.body.id;
  }
  return { republicaId, ids };
}

async function lanca(republicaId: number, despesa: Record<string, unknown>) {
  const resposta = await request(app)
    .post(`/api/republicas/${republicaId}/despesas`)
    .send({ descricao: "Despesa", data: DATA, ...despesa });
  assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
  return resposta.body.id as number;
}

async function saldos(republicaId: number) {
  const resposta = await request(app).get(`/api/republicas/${republicaId}/saldos`);
  assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
  return resposta.body as { moradorId: number; nome: string; saldoCentavos: number; situacao: string; saiu: boolean }[];
}

/** Só nome → centavos, para o assert ler como a tela. */
function porNome(lista: { nome: string; saldoCentavos: number }[]) {
  return Object.fromEntries(lista.map((s) => [s.nome, s.saldoCentavos]));
}

function soma(lista: { saldoCentavos: number }[]) {
  return lista.reduce((total, s) => total + s.saldoCentavos, 0);
}

describe("GET /api/republicas/:id/saldos", () => {
  it("sem despesas, todos aparecem quitados, em ordem alfabética", async () => {
    const { republicaId } = await montaCasa("Carla", "Bruno");

    const lista = await saldos(republicaId);

    assert.deepEqual(lista.map((s) => s.nome), ["Ana", "Bruno", "Carla"]);
    assert.ok(lista.every((s) => s.saldoCentavos === 0 && s.situacao === "quitado"));
  });

  it("deriva o saldo das despesas lançadas e a soma da casa é zero", async () => {
    const { republicaId, ids } = await montaCasa("Bruno", "Carla");
    // Aluguel de R$ 2.400,00 pago pela Ana entre os três; mercado de R$ 150,00
    // pago pelo Bruno só entre ele e a Carla (valores do seed).
    await lanca(republicaId, { valor: "2400,00", pagadorId: ids.Ana });
    await lanca(republicaId, {
      valor: "150,00",
      pagadorId: ids.Bruno,
      participantesIds: [ids.Bruno, ids.Carla],
    });

    const lista = await saldos(republicaId);

    assert.deepEqual(porNome(lista), { Ana: 160000, Bruno: -72500, Carla: -87500 });
    assert.deepEqual(lista.map((s) => s.situacao), ["a receber", "a pagar", "a pagar"]);
    assert.equal(soma(lista), 0);
  });

  it("pagador fora do rateio: o resto de 2 centavos vai inteiro para o menor id", async () => {
    const { republicaId, ids } = await montaCasa("Bruno", "Carla", "Davi");
    // R$ 100,01 entre três: 3333 cada e sobram 2 centavos. Quem pagou (Davi)
    // não participa, então a sobra vai para a Ana, de menor id.
    await lanca(republicaId, {
      valor: "100,01",
      pagadorId: ids.Davi,
      participantesIds: [ids.Carla, ids.Bruno, ids.Ana],
    });

    const lista = await saldos(republicaId);

    assert.deepEqual(porNome(lista), { Ana: -3335, Bruno: -3333, Carla: -3333, Davi: 10001 });
    assert.equal(soma(lista), 0);
  });
});
