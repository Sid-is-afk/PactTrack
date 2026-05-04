const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTasksByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: { userId },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTask = async (req, res) => {
  const { name, fineAmount, isPrivate, daysOfWeek, startTime, endTime, reminderTime, goalId } = req.body;
  const userId = req.user.uid;
  try {
    const task = await prisma.task.create({
      data: {
        name,
        fineAmount: fineAmount || 10,
        isPrivate: isPrivate || false,
        daysOfWeek,
        startTime,
        endTime,
        reminderTime,
        userId,
        goalId,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const task = await prisma.task.update({
      where: { id },
      data,
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTasksByUser,
  createTask,
  updateTask,
  deleteTask,
};
