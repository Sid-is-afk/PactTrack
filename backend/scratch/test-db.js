const { PrismaClient } = require('@prisma/client');

// Try pooled connection again with simplified params
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_GZS9fa4qywPb@ep-floral-band-aoi3cqeb-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

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
