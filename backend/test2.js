const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const pavitra = await prisma.user.findUnique({
    where: { email: 'pavitra@example.com' }, // or whatever Pavitra's email is
  });
  if (!pavitra) {
     const users = await prisma.user.findMany({ include: { taskLogs: true, fines: true } });
     console.log(JSON.stringify(users.map(u => ({name: u.name, logs: u.taskLogs.length, fines: u.fines.length})), null, 2));
     return;
  }
}
main().finally(() => prisma.$disconnect());
