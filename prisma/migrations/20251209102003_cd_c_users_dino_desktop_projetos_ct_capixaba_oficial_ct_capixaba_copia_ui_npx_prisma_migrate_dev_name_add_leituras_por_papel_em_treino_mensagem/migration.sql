/*
  Warnings:

  - You are about to drop the column `lidoEm` on the `TreinoMensagem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TreinoMensagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "treinoConclusaoId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lidoPeloAlunoEm" DATETIME,
    "lidoPeloCoachEm" DATETIME,
    CONSTRAINT "TreinoMensagem_treinoConclusaoId_fkey" FOREIGN KEY ("treinoConclusaoId") REFERENCES "TreinoConclusao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TreinoMensagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TreinoMensagem" ("autorId", "criadoEm", "id", "texto", "treinoConclusaoId") SELECT "autorId", "criadoEm", "id", "texto", "treinoConclusaoId" FROM "TreinoMensagem";
DROP TABLE "TreinoMensagem";
ALTER TABLE "new_TreinoMensagem" RENAME TO "TreinoMensagem";
CREATE INDEX "TreinoMensagem_treinoConclusaoId_criadoEm_idx" ON "TreinoMensagem"("treinoConclusaoId", "criadoEm");
CREATE INDEX "TreinoMensagem_treinoConclusaoId_lidoPeloAlunoEm_idx" ON "TreinoMensagem"("treinoConclusaoId", "lidoPeloAlunoEm");
CREATE INDEX "TreinoMensagem_treinoConclusaoId_lidoPeloCoachEm_idx" ON "TreinoMensagem"("treinoConclusaoId", "lidoPeloCoachEm");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
