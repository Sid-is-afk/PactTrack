const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAchievements = async (req, res) => {
  const userId = req.user.uid;
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAchievements };
