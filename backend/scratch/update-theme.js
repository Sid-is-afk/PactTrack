const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    data: { theme: 'light' }
  });
  console.log(`Updated ${result.count} users to light theme.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
