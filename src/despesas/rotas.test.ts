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

describe("POST /api/republicas/:id/despesas: divisão por valores e percentuais", () => {
  it("por valores: grava a parte informada de cada participante", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    const despesaId = await lanca(republicaId, {
      valor: "150,00",
      pagadorId: ids.Ana,
      participantesIds: [ids.Ana, ids.Bruno],
      tipoDivisao: "VALOR",
      partes: [{ moradorId: ids.Ana, valor: "100,00" }, { moradorId: ids.Bruno, valor: "50,00" }],
    });

    const gravada = await detalhe(republicaId, despesaId);

    assert.equal(gravada.tipoDivisao, "VALOR");
    assert.deepEqual(partes(gravada), { Ana: 10000, Bruno: 5000 });
    assert.ok(gravada.participacoes.every((p) => p.percentualCentesimos === null));
  });

  it("por valores que não fecham com o total: responde 400 e não grava nada", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);
    const resposta = await posta(republicaId, {
      descricao: "Luz", valor: "150,00", data: DATA, pagadorId: ids.Ana, tipoDivisao: "VALOR",
      partes: [{ moradorId: ids.Ana, valor: "100,00" }, { moradorId: ids.Bruno, valor: "49,99" }],
    });

    assert.equal(resposta.status, 400);
    assert.match(resposta.body.erro, /diferente do total/);
    await semDespesas(republicaId);
  });

  it("por percentuais: grava o percentual e a sobra de centavos fica com quem pagou", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    // R$ 100,01 em 33,33% / 33,33% / 33,34%: os arredondamentos para baixo
    // dão 3333 + 3333 + 3334 = 10000, e o centavo que sobra vai para o Bruno.
    const despesaId = await lanca(republicaId, {
      valor: "100,01",
      pagadorId: ids.Bruno,
      tipoDivisao: "PERCENTUAL",
      partes: [
        { moradorId: ids.Ana, valor: "33,33" },
        { moradorId: ids.Bruno, valor: "33,33" },
        { moradorId: ids.Carla, valor: "33,34" },
      ],
    });

    const gravada = await detalhe(republicaId, despesaId);

    assert.equal(gravada.tipoDivisao, "PERCENTUAL");
    assert.deepEqual(partes(gravada), { Ana: 3333, Bruno: 3334, Carla: 3334 });
    assert.deepEqual(gravada.participacoes.map((p) => p.percentualCentesimos), [3333, 3333, 3334]);
    assert.equal(soma(gravada), 10001);
  });
});

describe("GET /api/republicas/:id/despesas e /despesas/:despesaId", () => {
  it("lista da mais recente para a mais antiga, só da própria casa", async () => {
    const azul = await montaCasa(["Bruno"]);
    const verde = await montaCasa([], "Casa Verde", "Duda");
    const { Ana, Bruno } = azul.ids;
    await lanca(azul.republicaId, { descricao: "Luz", valor: "90,00", pagadorId: Bruno, data: "2026-09-10" });
    await lanca(azul.republicaId, { descricao: "Aluguel", valor: "900,00", pagadorId: Ana, data: "2026-10-01", recorrente: true });
    await lanca(azul.republicaId, { descricao: "Mercado", valor: "50,00", pagadorId: Bruno, data: "2026-10-01" });
    await lanca(verde.republicaId, { descricao: "Gás", valor: "30,00", pagadorId: verde.ids.Duda });

    const lista = (await request(app).get(`/api/republicas/${azul.republicaId}/despesas`)).body;

    // No mesmo dia, a lançada por último vem antes.
    assert.deepEqual(
      lista.map((d: { descricao: string; data: string; pagador: { nome: string }; recorrente: boolean }) =>
        [d.descricao, d.data, d.pagador.nome, d.recorrente]),
      [
        ["Mercado", "2026-10-01", "Bruno", false],
        ["Aluguel", "2026-10-01", "Ana", true],
        ["Luz", "2026-09-10", "Bruno", false],
      ],
    );
  });

  it("detalhe traz o rateio por nome, o tipo da divisão e a recorrência", async () => {
    // Carla entra antes do Bruno: por id a ordem seria Ana, Carla, Bruno.
    const { republicaId, ids } = await montaCasa(["Carla", "Bruno"]);
    const recorrente = await lanca(republicaId, { valor: "90,00", pagadorId: ids.Ana, data: "2026-10-05", recorrente: true });
    const avulsa = await lanca(republicaId, { valor: "90,00", pagadorId: ids.Ana });

    const gravada = await detalhe(republicaId, recorrente);

    assert.deepEqual(gravada.participacoes.map((p) => p.morador.nome), ["Ana", "Bruno", "Carla"]);
    assert.equal(gravada.tipoDivisao, "IGUAL");
    assert.deepEqual(gravada.recorrencia, { diaDoMes: 5 });
    assert.equal((await detalhe(republicaId, avulsa)).recorrencia, null);
  });

  it("detalhe de despesa de outra casa ou inexistente responde 404", async () => {
    const azul = await montaCasa();
    const verde = await montaCasa([], "Casa Verde", "Duda");
    const daVerde = await lanca(verde.republicaId, { valor: "30,00", pagadorId: verde.ids.Duda });

    for (const despesaId of [daVerde, 999]) {
      const resposta = await request(app).get(`/api/republicas/${azul.republicaId}/despesas/${despesaId}`);
      assert.equal(resposta.status, 404);
      assert.equal(resposta.body.erro, "Despesa não encontrada.");
    }
    assert.equal((await request(app).get(`/api/republicas/${azul.republicaId}/despesas/abc`)).status, 400);
  });
});

describe("GET /api/republicas/:id/moradores", () => {
  it("lista em ordem alfabética, com quem saiu e a data da saída", async () => {
    const { republicaId, ids } = await montaCasa(["Carla", "Bruno"]);
    await sai(republicaId, ids.Ana, ids.Bruno);

    const lista = (await request(app).get(`/api/republicas/${republicaId}/moradores`)).body;

    assert.deepEqual(lista.map((m: { nome: string }) => m.nome), ["Ana", "Bruno", "Carla"]);
    const [ana, bruno, carla] = lista;
    assert.equal(ana.organizador, true);
    assert.match(bruno.saiuEm, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(carla.saiuEm, null);
  });

  it("república inexistente responde 404 na lista de moradores e na de despesas", async () => {
    assert.equal((await request(app).get("/api/republicas/999/moradores")).status, 404);
    assert.equal((await request(app).get("/api/republicas/999/despesas")).status, 404);
  });
});

// T2-13: editar, excluir, filtros e recorrentes.

/** Corpo completo de uma edição; a tela manda todos os campos de novo. */
function edita(republicaId: number, despesaId: number, corpo: Record<string, unknown>) {
  return request(app)
    .put(`/api/republicas/${republicaId}/despesas/${despesaId}`)
    .send({ descricao: "Despesa", data: DATA, ...corpo });
}

function exclui(republicaId: number, despesaId: number, moradorId?: number) {
  return request(app).delete(`/api/republicas/${republicaId}/despesas/${despesaId}`).send({ moradorId });
}

describe("PUT /api/republicas/:id/despesas/:despesaId", () => {
  it("só quem pagou edita: outro morador recebe 403, sem moradorId 400, e nada muda", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);
    const despesaId = await lanca(republicaId, { valor: "90,00", pagadorId: ids.Ana });
    const novo = { valor: "120,00", pagadorId: ids.Ana };

    const deOutro = await edita(republicaId, despesaId, { ...novo, moradorId: ids.Bruno });
    assert.equal(deOutro.status, 403);
    assert.match(deOutro.body.erro, /Só quem pagou/);
    const semQuem = await edita(republicaId, despesaId, novo);
    assert.equal(semQuem.status, 400);
    assert.match(semQuem.body.erro, /Quem é você/);

    const gravada = await detalhe(republicaId, despesaId);
    assert.equal(gravada.valorCentavos, 9000);
    assert.deepEqual(partes(gravada), { Ana: 4500, Bruno: 4500 });
  });

  it("quem pagou edita e o rateio é refeito do zero", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    const despesaId = await lanca(republicaId, { valor: "90,00", pagadorId: ids.Ana });

    const resposta = await edita(republicaId, despesaId, {
      moradorId: ids.Ana, valor: "100,00", pagadorId: ids.Ana, participantesIds: [ids.Ana, ids.Bruno],
    });

    assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
    const gravada = await detalhe(republicaId, despesaId);
    // A Carla saiu do rateio: a participação antiga dela não pode sobrar.
    assert.deepEqual(partes(gravada), { Ana: 5000, Bruno: 5000 });
    assert.equal(soma(gravada), 10000);
  });

  it("quem saiu continua se já estava na despesa, mas não entra numa nova parte", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno", "Carla"]);
    const despesaId = await lanca(republicaId, {
      valor: "90,00", pagadorId: ids.Ana, participantesIds: [ids.Ana, ids.Carla],
    });
    await sai(republicaId, ids.Ana, ids.Carla);
    await sai(republicaId, ids.Ana, ids.Bruno);
    const base = { moradorId: ids.Ana, valor: "60,00", pagadorId: ids.Ana };

    const mantendo = await edita(republicaId, despesaId, { ...base, participantesIds: [ids.Ana, ids.Carla] });
    assert.equal(mantendo.status, 200, JSON.stringify(mantendo.body));
    assert.deepEqual(partes(await detalhe(republicaId, despesaId)), { Ana: 3000, Carla: 3000 });

    const incluindo = await edita(republicaId, despesaId, { ...base, participantesIds: [ids.Ana, ids.Bruno] });
    assert.equal(incluindo.status, 400);
    assert.match(incluindo.body.erro, /não é morador desta república/);
  });

  it("despesa excluída ou de outra casa responde 404", async () => {
    const azul = await montaCasa();
    const verde = await montaCasa([], "Casa Verde", "Duda");
    const excluida = await lanca(azul.republicaId, { valor: "10,00", pagadorId: azul.ids.Ana });
    await exclui(azul.republicaId, excluida, azul.ids.Ana).expect(204);
    const daVerde = await lanca(verde.republicaId, { valor: "10,00", pagadorId: verde.ids.Duda });

    for (const despesaId of [excluida, daVerde]) {
      const resposta = await edita(azul.republicaId, despesaId, { moradorId: azul.ids.Ana, valor: "20,00", pagadorId: azul.ids.Ana });
      assert.equal(resposta.status, 404);
      assert.equal(resposta.body.erro, "Despesa não encontrada.");
    }
  });
});
