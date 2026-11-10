/**
 * Banco dos testes, usado pelo `npm test` de duas formas:
 *
 * - com --import, em cada processo de teste: aponta o DATABASE_URL para o
 *   test.db antes de qualquer import do src/db.ts. O dotenv não sobrescreve
 *   variável já definida, então o .env (dev.db) não vale nos testes. Fica
 *   aqui, e não como `DATABASE_URL=... node`, pelo mesmo motivo do fuso: o
 *   cmd do Windows.
 * - com --test-global-setup, uma vez antes de todos os arquivos: apaga o
 *   test.db e o recria pelas migrations, para o schema sempre bater com a
 *   branch atual.
 *
 * É .mts e só importa módulos do Node porque o global setup é carregado pelo
 * Node direto, sem o tsx.
 */
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

process.env.DATABASE_URL = "file:./test.db";

export function globalSetup() {
  rmSync("test.db", { force: true });
  rmSync("test.db-journal", { force: true });
  execSync("npx prisma migrate deploy", { stdio: "pipe" });
}
