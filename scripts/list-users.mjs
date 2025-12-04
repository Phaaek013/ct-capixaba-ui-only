import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const users = await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true, tipo: true, senhaPrecisaTroca: true, senhaHash: true }
  });
  console.log(users);
};

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
