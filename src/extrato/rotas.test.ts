import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import request from "supertest";
import { app } from "../app";
import { hojeNaCasa } from "../despesas/validacao";
import { limpaBancoDeTeste } from "../testes/banco";
import { lanca, montaCasa } from "../testes/casa";

// Integração da E1: rota → serviço → test.db, sem mock.
beforeEach(limpaBancoDeTeste);

async function extrato(republicaId: number, mes?: string) {
  const consulta = mes === undefined ? "" : `?mes=${mes}`;
  const resposta = await request(app).get(`/api/republicas/${republicaId}/extrato${consulta}`);
  assert.equal(resposta.status, 200, JSON.stringify(resposta.body));
  return resposta.body;
}

/** Monta outubro de 2026 com despesas na borda do mês, fora dele e um acerto. */
async function montaOutubro() {
  const casa = await montaCasa(["Bruno", "Carla"]);
  const { republicaId, ids } = casa;
  await lanca(republicaId, { descricao: "Luz de setembro", valor: "90,00", pagadorId: ids.Carla, data: "2026-09-30" });
  await lanca(republicaId, { descricao: "Aluguel", valor: "2400,00", pagadorId: ids.Ana, data: "2026-10-01" });
  await lanca(republicaId, {
    descricao: "Mercado",
    valor: "150,00",
    pagadorId: ids.Bruno,
    participantesIds: [ids.Bruno, ids.Carla],
    data: "2026-10-31",
  });
  // Acerto não é gasto da casa: não entra no extrato.
  await request(app)
    .post(`/api/republicas/${republicaId}/pagamentos`)
    .send({ pagadorId: ids.Carla, recebedorId: ids.Ana, valor: "100", data: "2026-10-15" })
    .expect(201);
  return casa;
}

describe("GET /api/republicas/:id/extrato", () => {
  it("soma só as despesas do mês, do dia 1 ao último, e deixa os acertos de fora", async () => {
    const { republicaId } = await montaOutubro();

    const corpo = await extrato(republicaId, "2026-10");

    assert.equal(corpo.mes, "2026-10");
    assert.equal(corpo.totalCentavos, 255000);
    assert.deepEqual(
      corpo.despesas.map((d: { descricao: string; data: string; pagador: { nome: string } }) =>
        [d.descricao, d.data, d.pagador.nome]),
      [
        ["Mercado", "2026-10-31", "Bruno"],
        ["Aluguel", "2026-10-01", "Ana"],
      ],
    );
  });

  it("dá a cada morador o que ele tem a pagar e o que adiantou no mês", async () => {
    const { republicaId } = await montaOutubro();

    const { moradores } = await extrato(republicaId, "2026-10");

    assert.deepEqual(
      moradores.map((m: { nome: string; aPagarCentavos: number; pagoCentavos: number }) =>
        [m.nome, m.aPagarCentavos, m.pagoCentavos]),
      [
        ["Ana", 80000, 240000],
        ["Bruno", 87500, 15000],
        ["Carla", 87500, 0],
      ],
    );
  });

  it("mês sem despesas mostra todos zerados", async () => {
    const { republicaId } = await montaOutubro();

    const corpo = await extrato(republicaId, "2026-08");

    assert.equal(corpo.totalCentavos, 0);
    assert.deepEqual(corpo.despesas, []);
    assert.equal(corpo.moradores.length, 3);
  });

  it("despesa excluída sai do extrato", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);
    const despesaId = await lanca(republicaId, { valor: "60,00", pagadorId: ids.Bruno, data: "2026-10-05" });
    await request(app)
      .delete(`/api/republicas/${republicaId}/despesas/${despesaId}`)
      .send({ moradorId: ids.Bruno })
      .expect(204);

    const corpo = await extrato(republicaId, "2026-10");

    assert.equal(corpo.totalCentavos, 0);
    assert.deepEqual(corpo.despesas, []);
  });

  it("sem ?mes, usa o mês de hoje no calendário da casa", async () => {
    const { republicaId, ids } = await montaCasa();
    const hoje = hojeNaCasa();
    await lanca(republicaId, { valor: "10,00", pagadorId: ids.Ana, data: hoje });

    const corpo = await extrato(republicaId);

    assert.equal(corpo.mes, hoje.slice(0, 7));
    assert.equal(corpo.totalCentavos, 1000);
  });

  it("quem saiu aparece nos meses em que morava na casa e some depois", async () => {
    const { republicaId, ids } = await montaCasa(["Bruno"]);
    await request(app)
      .delete(`/api/republicas/${republicaId}/moradores/${ids.Bruno}`)
      .send({ moradorId: ids.Ana })
      .expect(200);
    const [ano, mes] = hojeNaCasa().slice(0, 7).split("-").map(Number);
    const mesSeguinte = mes === 12 ? `${ano + 1}-01` : `${ano}-${String(mes + 1).padStart(2, "0")}`;

    const nomes = async (m: string) =>
      (await extrato(republicaId, m)).moradores.map((x: { nome: string }) => x.nome);

    assert.deepEqual(await nomes(hojeNaCasa().slice(0, 7)), ["Ana", "Bruno"]);
    assert.deepEqual(await nomes(mesSeguinte), ["Ana"]);
  });
});

describe("extrato: erros da rota", () => {
  for (const mes of ["2026-13", "outubro", "2026-1"]) {
    it(`?mes=${mes} responde 400`, async () => {
      const { republicaId } = await montaCasa();
      const resposta = await request(app).get(`/api/republicas/${republicaId}/extrato?mes=${mes}`);
      assert.equal(resposta.status, 400);
      assert.match(resposta.body.erro, /Mês inválido/);
    });
  }

  it("república inexistente responde 404", async () => {
    const resposta = await request(app).get("/api/republicas/999/extrato?mes=2026-10");
    assert.equal(resposta.status, 404);
  });
});
