const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { awardXP } = require('../utils/gamification');

const getGoalsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: { 
        tasks: true,
        goalLogs: true
      }
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createGoal = async (req, res) => {
  const { title, description, startDate, endDate } = req.body;
  const userId = req.user.uid;
  try {
    const goal = await prisma.goal.create({
      data: { title, description, startDate, endDate, userId }
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate } = req.body;
  try {
    const goal = await prisma.goal.update({
      where: { id },
      data: { title, description, startDate, endDate }
    });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteGoal = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.goal.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleGoalLog = async (req, res) => {
  const { id } = req.params;
  const { date } = req.body; // YYYY-MM-DD
  const userId = req.user.uid;

  try {
    const existingLog = await prisma.goalLog.findUnique({
      where: {
        goalId_date: {
          goalId: id,
          date: date
        }
      }
    });

    if (existingLog) {
      await prisma.goalLog.delete({
        where: { id: existingLog.id }
      });
      res.json({ status: 'unmarked', date });
    } else {
      const newLog = await prisma.goalLog.create({
        data: {
          goalId: id,
          userId,
          date
        }
      });
      await awardXP(userId, 5);
      res.status(201).json({ status: 'marked', date, log: newLog });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getGoalsByUser,
  createGoal,
  updateGoal,
  deleteGoal,
  toggleGoalLog,
};
