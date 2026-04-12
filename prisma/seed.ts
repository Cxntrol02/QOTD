import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  const existingCount = await prisma.quote.count();
  if (existingCount > 0) {
    return;
  }

  await prisma.quote.createMany({
    data: [
      {
        text: "What is one thing you can do today that your future self will thank you for?",
        author: "QOTD",
        addedById: "seed"
      },
      {
        text: "What is a small habit that has made a big difference in your life?",
        author: "QOTD",
        addedById: "seed"
      },
      {
        text: "What challenge are you currently working through, and what are you learning from it?",
        author: "QOTD",
        addedById: "seed"
      }
    ]
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
