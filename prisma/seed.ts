import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { name: "Basic" },
    update: {},
    create: { name: "Basic", feeRate: 0.08, minFee: 200 },
  });
  await prisma.plan.upsert({
    where: { name: "Pro" },
    update: {},
    create: { name: "Pro", feeRate: 0.12, minFee: 500 },
  });
  await prisma.plan.upsert({
    where: { name: "Premium" },
    update: {},
    create: { name: "Premium", feeRate: 0.16, minFee: 1000 },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
