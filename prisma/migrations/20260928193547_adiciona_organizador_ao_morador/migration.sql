-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Morador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizador" BOOLEAN NOT NULL DEFAULT false,
    "republicaId" INTEGER NOT NULL,
    CONSTRAINT "Morador_republicaId_fkey" FOREIGN KEY ("republicaId") REFERENCES "Republica" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Morador" ("email", "id", "nome", "republicaId") SELECT "email", "id", "nome", "republicaId" FROM "Morador";
DROP TABLE "Morador";
ALTER TABLE "new_Morador" RENAME TO "Morador";
CREATE UNIQUE INDEX "Morador_email_key" ON "Morador"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
