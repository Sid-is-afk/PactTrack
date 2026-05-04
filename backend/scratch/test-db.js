const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient();

async function main() {
  console.log('Testing pooled connection...');
  try {
    const userCount = await prisma.user.count();
    console.log(`Connection successful. User count: ${userCount}`);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
