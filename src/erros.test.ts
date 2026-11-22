import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import request from "supertest";
import { app } from "./app";
import { prisma } from "./db";
import { limpaBancoDeTeste } from "./testes/banco";
import { montaCasa } from "./testes/casa";

// T2-17: como o servidor responde quando algo dá errado. Integração com o
// test.db, sem mock do Prisma.
beforeEach(limpaBancoDeTeste);

describe("erros do servidor", () => {
  it("JSON malformado no corpo responde 400 e não grava nada", async () => {
    const resposta = await request(app)
      .post("/api/republicas")
      .set("Content-Type", "application/json")
      .send('{"nome": ');

    assert.equal(resposta.status, 400);
    assert.deepEqual(resposta.body, { erro: "Corpo da requisição não é um JSON válido." });
    assert.equal(await prisma.republica.count(), 0);
  });

  it("recurso inexistente responde 404 em JSON", async () => {
    const resposta = await request(app).get("/api/republicas/999");

    assert.equal(resposta.status, 404);
    assert.match(resposta.headers["content-type"], /json/);
    assert.equal(typeof resposta.body.erro, "string");
  });

  it("rota /api que não existe responde 404 em JSON, não a página do Express", async () => {
    for (const [metodo, caminho] of [["get", "/api/nao-existe"], ["post", "/api/republicas/1/nada"]] as const) {
      const resposta = await request(app)[metodo](caminho);

      assert.equal(resposta.status, 404, `${metodo} ${caminho}`);
      assert.deepEqual(resposta.body, { erro: "Rota não encontrada." });
    }
  });

  it("falha do banco responde 500 com mensagem genérica, sem vazar o erro", async () => {
    const { republicaId } = await montaCasa();
    // Sem mock: some a tabela de pagamentos de verdade, e o Prisma falha ao
    // ler. Nenhuma outra tabela aponta para Pagamento, então renomear é
    // seguro; o finally devolve o nome mesmo se um assert falhar.
    const log = mock.method(console, "error", () => {});
    await prisma.$executeRawUnsafe('ALTER TABLE "Pagamento" RENAME TO "PagamentoSumido"');
    try {
      const resposta = await request(app).get(`/api/republicas/${republicaId}/pagamentos`);

      assert.equal(resposta.status, 500);
      assert.deepEqual(resposta.body, { erro: "Erro interno no servidor." });
      assert.doesNotMatch(resposta.text, /Pagamento|prisma|no such table/i);
      // O erro de verdade vai para o log do servidor.
      assert.equal(log.mock.callCount(), 1);
    } finally {
      await prisma.$executeRawUnsafe('ALTER TABLE "PagamentoSumido" RENAME TO "Pagamento"');
      log.mock.restore();
    }
    // A tabela voltou: a lista funciona de novo.
    assert.equal((await request(app).get(`/api/republicas/${republicaId}/pagamentos`)).status, 200);
  });
});
