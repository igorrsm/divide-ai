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

describe("GET /api/republicas/:id/saldos: o que muda o saldo depois", () => {
  it("despesa excluída sai do saldo", async () => {
    const { republicaId, ids } = await montaCasa("Bruno");
    const despesaId = await lanca(republicaId, { valor: "50,00", pagadorId: ids.Bruno });

    const excluida = await request(app)
      .delete(`/api/republicas/${republicaId}/despesas/${despesaId}`)
      .send({ moradorId: ids.Bruno });
    assert.equal(excluida.status, 204);

    assert.deepEqual(porNome(await saldos(republicaId)), { Ana: 0, Bruno: 0 });
  });

  it("acerto da dívida inteira deixa o devedor quitado e o credor sem nada a receber", async () => {
    const { republicaId, ids } = await montaCasa("Bruno");
    await lanca(republicaId, { valor: "100,00", pagadorId: ids.Ana });
    assert.deepEqual(porNome(await saldos(republicaId)), { Ana: 5000, Bruno: -5000 });

    const acerto = await request(app)
      .post(`/api/republicas/${republicaId}/pagamentos`)
      .send({ pagadorId: ids.Bruno, recebedorId: ids.Ana, valor: "50,00", data: DATA });
    assert.equal(acerto.status, 201, JSON.stringify(acerto.body));

    const lista = await saldos(republicaId);
    assert.deepEqual(porNome(lista), { Ana: 0, Bruno: 0 });
    assert.ok(lista.every((s) => s.situacao === "quitado"));
  });

  it("quem saiu aparece marcado enquanto deve e some depois de quitado", async () => {
    const { republicaId, ids } = await montaCasa("Bruno", "Carla");
    await lanca(republicaId, { valor: "90,00", pagadorId: ids.Ana, participantesIds: [ids.Ana, ids.Bruno] });
    for (const alvo of [ids.Bruno, ids.Carla]) {
      const saida = await request(app)
        .delete(`/api/republicas/${republicaId}/moradores/${alvo}`)
        .send({ moradorId: ids.Ana });
      assert.equal(saida.status, 200, JSON.stringify(saida.body));
    }

    // A Carla saiu quitada e some; o Bruno saiu devendo e continua, marcado.
    const antes = await saldos(republicaId);
    assert.deepEqual(antes.map((s) => [s.nome, s.saldoCentavos, s.saiu]), [
      ["Ana", 4500, false],
      ["Bruno", -4500, true],
    ]);

    await request(app)
      .post(`/api/republicas/${republicaId}/pagamentos`)
      .send({ pagadorId: ids.Bruno, recebedorId: ids.Ana, valor: "45,00", data: DATA })
      .expect(201);
    assert.deepEqual(porNome(await saldos(republicaId)), { Ana: 0 });
  });
});

describe("GET /api/republicas/:id/saldos/transferencias", () => {
  it("sugere o maior devedor pagando ao maior credor, até zerar", async () => {
    const { republicaId, ids } = await montaCasa("Bruno", "Carla");
    await lanca(republicaId, { valor: "2400,00", pagadorId: ids.Ana });
    await lanca(republicaId, {
      valor: "150,00",
      pagadorId: ids.Bruno,
      participantesIds: [ids.Bruno, ids.Carla],
    });

    const resposta = await request(app).get(`/api/republicas/${republicaId}/saldos/transferencias`);

    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.body, [
      { pagador: { id: ids.Carla, nome: "Carla" }, recebedor: { id: ids.Ana, nome: "Ana" }, valorCentavos: 87500 },
      { pagador: { id: ids.Bruno, nome: "Bruno" }, recebedor: { id: ids.Ana, nome: "Ana" }, valorCentavos: 72500 },
    ]);
  });

  it("com todos quitados, não sugere nada", async () => {
    const { republicaId } = await montaCasa("Bruno");
    const resposta = await request(app).get(`/api/republicas/${republicaId}/saldos/transferencias`);
    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.body, []);
  });
});

describe("saldos: erros da rota", () => {
  for (const caminho of ["saldos", "saldos/transferencias"]) {
    it(`${caminho}: república inexistente responde 404`, async () => {
      const resposta = await request(app).get(`/api/republicas/999/${caminho}`);
      assert.equal(resposta.status, 404);
      assert.equal(resposta.body.erro, "República não encontrada.");
    });

    it(`${caminho}: id que não é número responde 400`, async () => {
      const resposta = await request(app).get(`/api/republicas/abc/${caminho}`);
      assert.equal(resposta.status, 400);
      assert.ok(resposta.body.erro);
    });
  }
});
