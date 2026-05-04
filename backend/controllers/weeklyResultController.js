const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWeeklyResultsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const results = await prisma.weeklyResult.findMany({
      where: { userId },
      orderBy: { week: 'desc' },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addWeeklyResult = async (req, res) => {
  const { week, score } = req.body;
  const userId = req.user.uid;
  try {
    const result = await prisma.weeklyResult.create({
      data: { userId, week, score },
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWeeklyResultsByUser,
  addWeeklyResult,
};
