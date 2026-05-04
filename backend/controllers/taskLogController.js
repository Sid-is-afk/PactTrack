const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { awardXP } = require('../utils/gamification');

const getTaskLogsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const logs = await prisma.taskLog.findMany({
      where: { userId },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setTaskStatus = async (req, res) => {
  const { taskId, userId, date, status } = req.body;
  try {
    let log = await prisma.taskLog.findUnique({
      where: {
        taskId_date: { taskId, date }
      }
    });

    if (log) {
      if (status === 'pending') {
        await prisma.taskLog.delete({ where: { id: log.id } });
        return res.json({ message: 'Log removed' });
      } else {
        log = await prisma.taskLog.update({
          where: { id: log.id },
          data: { status }
        });
        if (status === 'done') await awardXP(userId, 10);
      }
    } else {
      if (status === 'pending') return res.json({ message: 'No action' });
      log = await prisma.taskLog.create({
        data: { taskId, userId, date, status }
      });
      if (status === 'done') await awardXP(userId, 10);
    }

    // Handle fine creation logic
    if (status === 'not-done') {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      await prisma.fine.create({
        data: {
          amount: task?.fineAmount || 10,
          date,
          month: date.substring(0, 7),
          userId,
          taskLogId: log.id,
        }
      });
    } else {
      // If status changed from not-done to something else, remove the fine
      await prisma.fine.deleteMany({
        where: { taskLogId: log.id }
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const carryForwardTask = async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;
  try {
    const log = await prisma.taskLog.update({
      where: { id },
      data: {
        carriedForwardDate: newDate,
        status: 'skipped'
      }
    });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTaskLogsByUser,
  setTaskStatus,
  carryForwardTask,
};
