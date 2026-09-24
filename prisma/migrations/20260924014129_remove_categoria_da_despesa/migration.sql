-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Despesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "tipoDivisao" TEXT NOT NULL DEFAULT 'IGUAL',
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "republicaId" INTEGER NOT NULL,
    "pagadorId" INTEGER NOT NULL,
    CONSTRAINT "Despesa_republicaId_fkey" FOREIGN KEY ("republicaId") REFERENCES "Republica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Despesa_pagadorId_fkey" FOREIGN KEY ("pagadorId") REFERENCES "Morador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Despesa" ("criadaEm", "data", "descricao", "id", "pagadorId", "republicaId", "tipoDivisao", "valorCentavos") SELECT "criadaEm", "data", "descricao", "id", "pagadorId", "republicaId", "tipoDivisao", "valorCentavos" FROM "Despesa";
DROP TABLE "Despesa";
ALTER TABLE "new_Despesa" RENAME TO "Despesa";
CREATE INDEX "Despesa_republicaId_data_idx" ON "Despesa"("republicaId", "data");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

