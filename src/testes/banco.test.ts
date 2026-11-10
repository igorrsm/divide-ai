import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { beforeEach, test } from "node:test";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../db";
import { PrismaClient } from "../generated/prisma/client";
import { arquivoDoBanco, limpaBancoDeTeste, limpaComTrava } from "./banco";

beforeEach(limpaBancoDeTeste);

const novaRepublica = {
  nome: "Casa Azul",
  nomeOrganizador: "Duda",
  emailOrganizador: "duda@exemplo.com",
};

async function contagens() {
  return {
    republica: await prisma.republica.count(),
    morador: await prisma.morador.count(),
    despesa: await prisma.despesa.count(),
    participacao: await prisma.participacao.count(),
    despesaRecorrente: await prisma.despesaRecorrente.count(),
    pagamento: await prisma.pagamento.count(),
    convite: await prisma.convite.count(),
  };
}

test("os testes abrem o test.db, não o dev.db", async () => {
  assert.equal(basename(await arquivoDoBanco(prisma)), "test.db");
});

test("a limpeza apaga todas as tabelas e os ids recomeçam do 1", async () => {
  const criada = await request(app).post("/api/republicas").send(novaRepublica);
  assert.equal(criada.status, 201);
  const lancada = await request(app)
    .post(`/api/republicas/${criada.body.id}/despesas`)
    .send({
      descricao: "Aluguel",
      valor: "900,00",
      data: "2026-11-01",
      pagadorId: criada.body.moradores[0].id,
      recorrente: true,
    });
  assert.equal(lancada.status, 201, JSON.stringify(lancada.body));
  assert.deepEqual(await contagens(), {
    republica: 1, morador: 1, despesa: 1, participacao: 1, despesaRecorrente: 1, pagamento: 0, convite: 0,
  });

  await limpaBancoDeTeste();

  assert.deepEqual(await contagens(), {
    republica: 0, morador: 0, despesa: 0, participacao: 0, despesaRecorrente: 0, pagamento: 0, convite: 0,
  });
  // Mesmo e-mail de novo: só passa porque o morador anterior foi apagado.
  const recriada = await request(app).post("/api/republicas").send(novaRepublica);
  assert.equal(recriada.status, 201);
  assert.equal(recriada.body.id, 1);
});

test("a limpeza recusa um banco que não é o test.db", async () => {
  const pasta = mkdtempSync(join(tmpdir(), "divide-ai-"));
  const outro = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: `file:${join(pasta, "dev.db")}` }),
  });
  try {
    await assert.rejects(limpaComTrava(outro), /só roda no test\.db/);
  } finally {
    await outro.$disconnect();
    rmSync(pasta, { recursive: true, force: true });
  }
});
