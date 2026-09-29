-- CreateTable
CREATE TABLE "Convite" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usadoEm" DATETIME,
    "republicaId" INTEGER NOT NULL,
    CONSTRAINT "Convite_republicaId_fkey" FOREIGN KEY ("republicaId") REFERENCES "Republica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
