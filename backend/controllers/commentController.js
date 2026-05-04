const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addComment = async (req, res) => {
  const { taskLogId, text } = req.body;
  const fromUserId = req.user.uid;
  try {
    const comment = await prisma.comment.create({
      data: { fromUserId, taskLogId, text: text.substring(0, 100) },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.comment.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addComment,
  deleteComment,
};
