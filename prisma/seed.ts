import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: "Standard",
      slug: "standard",
      priceCents: 4600,
    },
    {
      name: "Pro",
      slug: "pro",
      priceCents: 8400,
    },
    {
      name: "Max",
      slug: "max",
      priceCents: 12000,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: {
        slug: plan.slug,
      },
      update: {
        name: plan.name,
        priceCents: plan.priceCents,
        active: true,
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        priceCents: plan.priceCents,
        active: true,
      },
    });
  }

  console.log("Planos cadastrados com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });