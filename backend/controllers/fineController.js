const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFinesByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const fines = await prisma.fine.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    res.json(fines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFine = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.fine.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFinesByUser,
  deleteFine,
};
