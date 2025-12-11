-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "senhaHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'Coach',
    "senhaPrecisaTroca" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "motivoBloqueio" TEXT NOT NULL DEFAULT 'NENHUM',
    "diaVencimentoMensalidade" INTEGER,
    "proximoVencimentoEm" DATETIME,
    "ultimoPagamentoEm" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Usuario" ("ativo", "avatarUrl", "createdAt", "diaVencimentoMensalidade", "email", "id", "nome", "proximoVencimentoEm", "senhaHash", "senhaPrecisaTroca", "tipo", "ultimoPagamentoEm", "updatedAt") SELECT "ativo", "avatarUrl", "createdAt", "diaVencimentoMensalidade", "email", "id", "nome", "proximoVencimentoEm", "senhaHash", "senhaPrecisaTroca", "tipo", "ultimoPagamentoEm", "updatedAt" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
