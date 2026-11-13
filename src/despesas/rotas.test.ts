import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { app } from "../app";
import { limpaBancoDeTeste } from "../testes/banco";
import { DATA, lanca, montaCasa } from "../testes/casa";

// Integração das despesas (B1 a B5): rota → serviço → test.db, sem mock.
// Cada lançamento é relido pelo detalhe, para conferir o que ficou gravado.
beforeEach(limpaBancoDeTeste);

type Detalhe = {
  valorCentavos: number;
  tipoDivisao: string;
  participacoes: { valorCentavos: number; percentualCentesimos: number | null; morador: { nome: string } }[];
  recorrencia: { diaDoMes: number } | null;
};

async function detalhe(republicaId: number, despesaId: number) {
  const resposta = await request(app).get(`/api/republicas/${republicaId}/despesas/${despesaId}`);
  assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
  return resposta.body as Detalhe;
}

/** Só nome → centavos de cada participação gravada. */
function partes(despesa: Detalhe) {
  return Object.fromEntries(despesa.participacoes.map((p) => [p.morador.nome, p.valorCentavos]));
}

function soma(despesa: Detalhe) {
  return despesa.participacoes.reduce((total, p) => total + p.valorCentavos, 0);
}

describe("POST /api/republicas/:id/despesas: rateio igual", () => {
  it("sem participantes escolhidos, divide entre todos e a sobra fica com quem pagou", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    // R$ 100,00 entre três: 3333 cada e sobra 1 centavo. Quem pagou é o
    // Bruno (id 2), não o menor id, para separar as duas regras da sobra.
    const despesaId = await lanca(republicaId, { valor: "100,00", pagadorId: ids.Bruno });

    const gravada = await detalhe(republicaId, despesaId);

    assert.equal(gravada.tipoDivisao, "IGUAL");
    assert.deepEqual(partes(gravada), { Ana: 3333, Bruno: 3334, Carla: 3333 });
    assert.equal(soma(gravada), gravada.valorCentavos);
  });

  it("pagador fora do rateio: não ganha participação e a sobra vai para o menor id", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    // A pizza do E2E-2: R$ 100,01 pagos pela Ana só para Bruno e Carla.
    const resposta = await request(app)
      .post(`/api/republicas/${republicaId}/despesas`)
      .send({
        descricao: "Pizza",
        valor: "100,01",
        data: DATA,
        pagadorId: ids.Ana,
        participantesIds: [ids.Carla, ids.Bruno],
      });

    assert.equal(resposta.status, 201, JSON.stringify(resposta.body));
    assert.equal(resposta.body.valorCentavos, 10001);
    assert.deepEqual(resposta.body.participacoes, [
      { moradorId: ids.Bruno, valorCentavos: 5001 },
      { moradorId: ids.Carla, valorCentavos: 5000 },
    ]);
    assert.deepEqual(partes(await detalhe(republicaId, resposta.body.id)), { Bruno: 5001, Carla: 5000 });
  });

  it("participante repetido na lista ganha uma participação só", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    const despesaId = await lanca(republicaId, {
      valor: "60,00",
      pagadorId: ids.Carla,
      participantesIds: [ids.Carla, ids.Bruno, ids.Carla],
    });

    assert.deepEqual(partes(await detalhe(republicaId, despesaId)), { Bruno: 3000, Carla: 3000 });
  });
});

function posta(republicaId: number | string, corpo: Record<string, unknown>) {
  return request(app).post(`/api/republicas/${republicaId}/despesas`).send(corpo);
}

/** Depois de uma recusa, nenhuma despesa pode ter ficado gravada. */
async function semDespesas(republicaId: number) {
  const resposta = await request(app).get(`/api/republicas/${republicaId}/despesas`);
  assert.deepEqual(resposta.body, []);
}

async function sai(republicaId: number, organizadorId: number, moradorId: number) {
  await request(app)
    .delete(`/api/republicas/${republicaId}/moradores/${moradorId}`)
    .send({ moradorId: organizadorId })
    .expect(200);
}

describe("POST /api/republicas/:id/despesas: quem pode entrar", () => {
  it("quem saiu da casa fica fora do \"todos participam\"", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    await sai(republicaId, ids.Ana, ids.Carla);

    const despesaId = await lanca(republicaId, { valor: "100,00", pagadorId: ids.Ana });

    assert.deepEqual(partes(await detalhe(republicaId, despesaId)), { Ana: 5000, Bruno: 5000 });
  });

  const casos: [string, (c: { ids: Record<string, number>; duda: number }) => Record<string, unknown>, RegExp][] = [
    ["pagador que saiu", ({ ids }) => ({ pagadorId: ids.Carla }), /Quem pagou precisa ser um morador desta república/],
    ["participante que saiu", ({ ids }) => ({ participantesIds: [ids.Ana, ids.Carla] }), /não é morador desta república/],
    ["pagador de outra casa", ({ duda }) => ({ pagadorId: duda }), /Quem pagou precisa ser um morador desta república/],
    ["participante de outra casa", ({ ids, duda }) => ({ participantesIds: [ids.Ana, duda] }), /não é morador desta república/],
  ];
  for (const [nome, troca, mensagem] of casos) {
    it(`${nome}: responde 400 e não grava nada`, async () => {
      const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
      await sai(republicaId, ids.Ana, ids.Carla);
      const duda = (await montaCasa([], "Casa Verde", "Duda")).ids.Duda;

      const resposta = await posta(republicaId, {
        descricao: "Luz", valor: "90,00", data: DATA, pagadorId: ids.Ana, ...troca({ ids, duda }),
      });

      assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
      assert.match(resposta.body.erro, mensagem);
      await semDespesas(republicaId);
    });
  }
});

describe("POST /api/republicas/:id/despesas: entrada inválida", () => {
  const casos: [string, Record<string, unknown>, RegExp][] = [
    ["participantes vazio", { participantesIds: [] }, /ao menos um morador/],
    ["participantes fora de uma lista", { participantesIds: "1" }, /numa lista/],
    ["valor com três casas", { valor: "10,001" }, /Valor inválido/],
    ["data futura", { data: "2999-01-01" }, /futura/],
    ["sem descrição", { descricao: "  " }, /Descrição é obrigatória/],
  ];
  for (const [nome, troca, mensagem] of casos) {
    it(`${nome}: responde 400 e não grava nada`, async () => {
      const { republicaId, ids } = await montaCasa(["Bruno"]);

      const resposta = await posta(republicaId, {
        descricao: "Luz", valor: "90,00", data: DATA, pagadorId: ids.Ana, ...troca,
      });

      assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
      assert.match(resposta.body.erro, mensagem);
      await semDespesas(republicaId);
    });
  }

  it("república inexistente responde 404 e id que não é número, 400", async () => {
    const corpo = { descricao: "Luz", valor: "90,00", data: DATA, pagadorId: 1 };
    assert.equal((await posta(999, corpo)).status, 404);
    assert.equal((await posta("abc", corpo)).status, 400);
  });
});
