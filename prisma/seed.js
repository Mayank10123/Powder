const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.quotaReset.deleteMany({});
  await prisma.providerAssignment.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.leadAssignmentEvent.deleteMany({});

  // Create services
  const service1 = await prisma.service.create({ data: { name: "Service 1" } });
  const service2 = await prisma.service.create({ data: { name: "Service 2" } });
  const service3 = await prisma.service.create({ data: { name: "Service 3" } });

  console.log("Services created:", { service1, service2, service3 });

  // Create 8 providers
  const providers = [];
  for (let i = 1; i <= 8; i++) {
    const provider = await prisma.provider.create({
      data: {
        name: `Provider ${i}`,
        email: `provider${i}@prowider.com`,
        monthlyQuota: 10,
        leadsReceivedCount: 0,
        service1RoundRobinIndex: 0,
        service2RoundRobinIndex: 0,
        service3RoundRobinIndex: 0,
        currentMonth: new Date().getMonth() + 1,
        currentYear: new Date().getFullYear(),
      },
    });
    providers.push(provider);
    console.log(`Provider ${i} created:`, provider);
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
