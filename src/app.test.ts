import assert from "node:assert/strict";
import { test } from "node:test";
import request from "supertest";
import { app } from "./app";

test("importar o app não deixa servidor escutando porta", () => {
  // TCPServerWrap é o recurso que o Node cria quando um servidor faz listen.
  const recursos = process.getActiveResourcesInfo();
  assert.ok(!recursos.includes("TCPServerWrap"), `recursos ativos: ${recursos.join(", ")}`);
});

test("GET /api/health responde sem subir o servidor na porta 3000", async () => {
  const resposta = await request(app).get("/api/health");

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.body, { status: "ok" });
});
