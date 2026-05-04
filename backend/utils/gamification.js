const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const XP_PER_TASK = 10;
const XP_PER_GOAL_CHECKIN = 5;
const XP_PER_LEVEL = 100;

const awardXP = async (userId, amount) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  let newXP = (user.xp || 0) + amount;
  let newLevel = user.level || 1;

  while (newXP >= XP_PER_LEVEL) {
    newXP -= XP_PER_LEVEL;
    newLevel += 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: newLevel }
  });

  // Check for achievements
  await checkAchievements(userId);
};

const checkAchievements = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      taskLogs: { where: { status: 'done' } },
      goals: true,
      achievements: true
    }
  });

  const existingAchievementNames = user.achievements.map(a => a.name);

  const award = async (name, description, icon) => {
    if (!existingAchievementNames.includes(name)) {
      await prisma.achievement.create({
        data: { name, description, icon, userId }
      });
    }
  };

  // Milestone: First Task
  if (user.taskLogs.length >= 1) {
    await award('Early Bird', 'Completed your first task!', '🌅');
  }

  // Milestone: 10 Tasks
  if (user.taskLogs.length >= 10) {
    await award('Habit Builder', 'Completed 10 tasks!', '🏗️');
  }

  // Milestone: 50 Tasks
  if (user.taskLogs.length >= 50) {
    await award('Consistency King', 'Completed 50 tasks!', '👑');
  }

  // Milestone: Level 5
  if (user.level >= 5) {
    await award('High Achiever', 'Reached Level 5!', '🚀');
  }
};

module.exports = { awardXP, checkAchievements };
