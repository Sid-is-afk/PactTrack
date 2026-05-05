const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    include: {
      tasks: true,
      taskLogs: true,
      fines: true
    }
  });
  console.log(JSON.stringify(users.map(u => ({ name: u.name, tasks: u.tasks.length, logs: u.taskLogs.length, fines: u.fines.length, fineDetails: u.fines })), null, 2));
}
main().finally(() => prisma.$disconnect());
