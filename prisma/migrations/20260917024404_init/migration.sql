-- CreateTable
CREATE TABLE "Republica" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Morador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "republicaId" INTEGER NOT NULL,
    CONSTRAINT "Morador_republicaId_fkey" FOREIGN KEY ("republicaId") REFERENCES "Republica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipoDivisao" TEXT NOT NULL DEFAULT 'IGUAL',
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "republicaId" INTEGER NOT NULL,
    "pagadorId" INTEGER NOT NULL,
    CONSTRAINT "Despesa_republicaId_fkey" FOREIGN KEY ("republicaId") REFERENCES "Republica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Despesa_pagadorId_fkey" FOREIGN KEY ("pagadorId") REFERENCES "Morador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participacao" (
    "despesaId" INTEGER NOT NULL,
    "moradorId" INTEGER NOT NULL,
    "valorCentavos" INTEGER NOT NULL,

    PRIMARY KEY ("despesaId", "moradorId"),
    CONSTRAINT "Participacao_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "Despesa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Participacao_moradorId_fkey" FOREIGN KEY ("moradorId") REFERENCES "Morador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valorCentavos" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "republicaId" INTEGER NOT NULL,
    "pagadorId" INTEGER NOT NULL,
    "recebedorId" INTEGER NOT NULL,
    CONSTRAINT "Pagamento_republicaId_fkey" FOREIGN KEY ("republicaId") REFERENCES "Republica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_pagadorId_fkey" FOREIGN KEY ("pagadorId") REFERENCES "Morador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_recebedorId_fkey" FOREIGN KEY ("recebedorId") REFERENCES "Morador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DespesaRecorrente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "diaDoMes" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "dataFim" DATETIME,
    "ultimaGeracao" DATETIME,
    CONSTRAINT "DespesaRecorrente_id_fkey" FOREIGN KEY ("id") REFERENCES "Despesa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Morador_email_key" ON "Morador"("email");

-- CreateIndex
CREATE INDEX "Despesa_republicaId_data_idx" ON "Despesa"("republicaId", "data");
