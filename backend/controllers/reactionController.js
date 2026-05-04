const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const toggleReaction = async (req, res) => {
  const { taskLogId, emoji } = req.body;
  const fromUserId = req.user.uid;
  try {
    const existing = await prisma.reaction.findFirst({
      where: { fromUserId, taskLogId },
    });

    if (existing && existing.emoji === emoji) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return res.json({ message: 'Reaction removed' });
    }

    if (existing) {
      const updated = await prisma.reaction.update({
        where: { id: existing.id },
        data: { emoji },
      });
      return res.json(updated);
    }

    const reaction = await prisma.reaction.create({
      data: { fromUserId, taskLogId, emoji },
    });
    res.status(201).json(reaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  toggleReaction,
};
