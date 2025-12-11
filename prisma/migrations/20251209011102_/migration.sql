-- CreateTable
CREATE TABLE "TreinoConclusao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "treinoId" TEXT NOT NULL,
    "dataConclusao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedbackText" TEXT,
    CONSTRAINT "TreinoConclusao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TreinoConclusao_usuarioId_idx" ON "TreinoConclusao"("usuarioId");

-- CreateIndex
CREATE INDEX "TreinoConclusao_treinoId_idx" ON "TreinoConclusao"("treinoId");

-- CreateIndex
CREATE UNIQUE INDEX "TreinoConclusao_usuarioId_treinoId_key" ON "TreinoConclusao"("usuarioId", "treinoId");
