-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Treino" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alunoId" INTEGER,
    "coachId" INTEGER,
    "dataTreino" DATETIME,
    "conteudo" TEXT,
    "videoUrl" TEXT,
    "ehModelo" BOOLEAN NOT NULL DEFAULT false,
    "nomeModelo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Treino_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Treino_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Treino" ("alunoId", "conteudo", "createdAt", "dataTreino", "ehModelo", "id", "nomeModelo", "updatedAt", "videoUrl") SELECT "alunoId", "conteudo", "createdAt", "dataTreino", "ehModelo", "id", "nomeModelo", "updatedAt", "videoUrl" FROM "Treino";
DROP TABLE "Treino";
ALTER TABLE "new_Treino" RENAME TO "Treino";
CREATE INDEX "Treino_coachId_idx" ON "Treino"("coachId");
CREATE INDEX "Treino_ehModelo_idx" ON "Treino"("ehModelo");
CREATE UNIQUE INDEX "Treino_alunoId_dataTreino_key" ON "Treino"("alunoId", "dataTreino");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
