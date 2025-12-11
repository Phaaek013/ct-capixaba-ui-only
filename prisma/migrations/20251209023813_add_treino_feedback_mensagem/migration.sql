-- CreateTable
CREATE TABLE "TreinoFeedbackMensagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "treinoConclusaoId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,
    "autorTipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TreinoFeedbackMensagem_treinoConclusaoId_fkey" FOREIGN KEY ("treinoConclusaoId") REFERENCES "TreinoConclusao" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TreinoFeedbackMensagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TreinoFeedbackMensagem_treinoConclusaoId_idx" ON "TreinoFeedbackMensagem"("treinoConclusaoId");

-- CreateIndex
CREATE INDEX "TreinoFeedbackMensagem_autorId_idx" ON "TreinoFeedbackMensagem"("autorId");
