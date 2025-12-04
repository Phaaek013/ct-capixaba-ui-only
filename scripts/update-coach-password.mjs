import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const senhaHash = "$2a$10$wMgt.NNqYilf43LFZ0aEUOwQ9KZeAvwqxw5swLXFmqaMfNkOVQeua";
  const result = await prisma.usuario.update({
    where: { email: "coach@teste.com" },
    data: { senhaHash }
  });
  console.log("Coach atualizado:", { id: result.id, email: result.email });
};

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
