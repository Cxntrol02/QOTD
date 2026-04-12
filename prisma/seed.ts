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
        text: "Discipline is choosing between what you want now and what you want most.",
        author: "Abraham Lincoln",
        addedById: "seed"
      },
      {
        text: "Small steps every day compound into big outcomes.",
        author: "Unknown",
        addedById: "seed"
      },
      {
        text: "Stay consistent, even when motivation leaves.",
        author: "Unknown",
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
