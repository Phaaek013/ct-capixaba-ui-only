const { PrismaClient } = require("../node_modules/@prisma/client");

const prisma = new PrismaClient();

const items = [
  {
    titulo: "Plano de Treino Semanal",
    slug: "plano-treino-semanal",
    descricao: "CT CAPIXABA",
    arquivoPath: "/pdfs/plano-treino-semanal.pdf"
  },
  {
    titulo: "Guia de Nutrição – Fase 1",
    slug: "guia-nutricao-fase-1",
    descricao: "CT CAPIXABA",
    arquivoPath: "/pdfs/guia-nutricao-fase-1.pdf"
  },
  {
    titulo: "Avaliação Física – 2024",
    slug: "avaliacao-fisica-2024",
    descricao: "CT CAPIXABA",
    arquivoPath: "/pdfs/avaliacao-fisica-2024.pdf"
  }
];

async function main() {
  for (const item of items) {
    await prisma.pdf.upsert({
      where: { slug: item.slug },
      update: item,
      create: item
    });
  }

  console.log("PDFs semeados/atualizados");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
