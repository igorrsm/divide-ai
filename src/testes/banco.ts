import { basename } from "node:path";
import { prisma } from "../db";
import type { PrismaClient } from "../generated/prisma/client";
import { limpaBanco } from "../limpaBanco";

/** Caminho do arquivo que a conexão abriu, lido do próprio SQLite. */
export async function arquivoDoBanco(cliente: PrismaClient) {
  const bancos = await cliente.$queryRawUnsafe<{ name: string; file: string }[]>(
    "PRAGMA database_list",
  );
  return bancos.find((banco) => banco.name === "main")?.file ?? "";
}

/**
 * Limpa o banco só se a conexão estiver no test.db. A trava confere o
 * arquivo aberto, não a variável de ambiente: se alguém rodar um teste sem o
 * `npm test`, o src/db.ts cai no dev.db do .env, e a limpeza apagaria os dados
 * de quem está desenvolvendo.
 */
export async function limpaComTrava(cliente: PrismaClient) {
  const arquivo = await arquivoDoBanco(cliente);
  if (basename(arquivo) !== "test.db") {
    throw new Error(
      `A limpeza só roda no test.db, e a conexão está em "${arquivo}". Rode os testes pelo npm test.`,
    );
  }
  await limpaBanco(cliente);
}

/** Uso nos testes de integração: `beforeEach(limpaBancoDeTeste)`. */
export function limpaBancoDeTeste() {
  return limpaComTrava(prisma);
}
