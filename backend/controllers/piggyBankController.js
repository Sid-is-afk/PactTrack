const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPiggyBankByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const piggyBank = await prisma.piggyBank.findFirst({
      where: { userId },
    });
    res.json(piggyBank || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setPiggyBankPurpose = async (req, res) => {
  const { purpose } = req.body;
  const userId = req.user.uid;
  try {
    const piggyBank = await prisma.piggyBank.upsert({
      where: { userId }, // This assumes @@unique([userId]) which I should probably add to schema
      update: { purpose },
      create: { userId, purpose },
    });
    res.json(piggyBank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPiggyBankByUser,
  setPiggyBankPurpose,
};
