/*
  Warnings:

  - You are about to drop the `TreinoFeedbackMensagem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TreinoFeedbackMensagem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TreinoMensagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "treinoConclusaoId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lidoEm" DATETIME,
    CONSTRAINT "TreinoMensagem_treinoConclusaoId_fkey" FOREIGN KEY ("treinoConclusaoId") REFERENCES "TreinoConclusao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TreinoMensagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TreinoMensagem_treinoConclusaoId_criadoEm_idx" ON "TreinoMensagem"("treinoConclusaoId", "criadoEm");
