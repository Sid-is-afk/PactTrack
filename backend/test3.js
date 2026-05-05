const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const friendData = await prisma.user.findUnique({
    where: { id: "UJ1Hq9IPiGQun430kwbqbe7tamW2" }, // Pavitra
    include: {
      tasks: {
        where: { isPrivate: false }
      },
      taskLogs: {
        where: { task: { isPrivate: false } }
      },
      fines: {
        where: { taskLog: { task: { isPrivate: false } } }
      }
    }
  });
  console.log(JSON.stringify(friendData, null, 2));
}
main().finally(() => prisma.$disconnect());
