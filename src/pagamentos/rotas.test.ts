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

describe("POST /api/republicas/:id/pagamentos: entrada inválida", () => {
  const casos: [string, Record<string, unknown>, RegExp][] = [
    ["pagar a si mesmo", { pagador: "Bruno", recebedor: "Bruno" }, /si mesmo/],
    ["valor zero", { valor: "0" }, /maior que zero/],
    ["valor negativo", { valor: "-10" }, /maior que zero/],
    ["valor com três casas", { valor: "10,001" }, /Valor inválido/],
    ["sem valor", { valor: undefined }, /Valor é obrigatório/],
    ["data futura", { data: "2999-01-01" }, /futura/],
    ["data que não existe", { data: "2026-02-30" }, /inexistente/],
    ["sem quem pagou", { pagador: undefined }, /quem pagou inválido/],
  ];

  for (const [nome, troca, mensagem] of casos) {
    it(`${nome}: responde 400 e não grava nada`, async () => {
      const { republicaId, ids } = await montaCasa(["Bruno"]);
      const nomes = { pagador: "Bruno", recebedor: "Ana", ...troca };
      const acerto = {
        pagadorId: nomes.pagador ? ids[nomes.pagador as string] : undefined,
        recebedorId: ids[nomes.recebedor as string],
        valor: "valor" in troca ? troca.valor : "50,00",
        data: troca.data ?? DATA,
      };

      const resposta = await registra(republicaId, acerto);

      assert.equal(resposta.status, 400, JSON.stringify(resposta.body));
      assert.match(resposta.body.erro, mensagem);
      assert.deepEqual(await lista(republicaId), []);
    });
  }

  it("morador de outra república responde 400", async () => {
    const azul = await montaCasa(["Bruno"]);
    const verde = await montaCasa([], "Casa Verde", "Duda");

    const resposta = await registra(azul.republicaId, {
      pagadorId: verde.ids.Duda,
      recebedorId: azul.ids.Ana,
      valor: "10",
      data: DATA,
    });

    assert.equal(resposta.status, 400);
    assert.match(resposta.body.erro, /não é desta república/);
  });
});

describe("GET /api/republicas/:id/pagamentos", () => {
  it("lista do mais recente para o mais antigo, com os nomes, só da própria casa", async () => {
    const azul = await montaCasa(["Bruno", "Carla"]);
    const verde = await montaCasa(["Edu"], "Casa Verde", "Duda");
    const { Ana, Bruno, Carla } = azul.ids;
    await registra(azul.republicaId, { pagadorId: Bruno, recebedorId: Ana, valor: "10", data: "2026-09-15" }).expect(201);
    await registra(azul.republicaId, { pagadorId: Carla, recebedorId: Ana, valor: "20", data: "2026-10-02" }).expect(201);
    await registra(azul.republicaId, { pagadorId: Ana, recebedorId: Bruno, valor: "30", data: "2026-09-15" }).expect(201);
    await registra(verde.republicaId, { pagadorId: verde.ids.Edu, recebedorId: verde.ids.Duda, valor: "99", data: DATA }).expect(201);

    const acertos = await lista(azul.republicaId);

    // No mesmo dia, o registrado por último vem antes.
    assert.deepEqual(
      acertos.map((a: { pagador: { nome: string }; recebedor: { nome: string }; valorCentavos: number; data: string }) =>
        [a.pagador.nome, a.recebedor.nome, a.valorCentavos, a.data]),
      [
        ["Carla", "Ana", 2000, "2026-10-02"],
        ["Ana", "Bruno", 3000, "2026-09-15"],
        ["Bruno", "Ana", 1000, "2026-09-15"],
      ],
    );
  });

  it("sem acertos, devolve lista vazia", async () => {
    const { republicaId } = await montaCasa();
    assert.deepEqual(await lista(republicaId), []);
  });
});

describe("pagamentos: erros da rota", () => {
  it("república inexistente responde 404 no GET e no POST", async () => {
    assert.equal((await request(app).get("/api/republicas/999/pagamentos")).status, 404);
    assert.equal((await registra(999, { valor: "10" })).status, 404);
  });

  it("id que não é número responde 400", async () => {
    assert.equal((await request(app).get("/api/republicas/abc/pagamentos")).status, 400);
  });
});
