const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        participants: {
          include: {
            user: { select: { name: true, xp: true, level: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createChallenge = async (req, res) => {
  const { title, description, type, startDate, endDate } = req.body;
  const userId = req.user.uid;
  try {
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        creatorId: userId,
        participants: {
          create: { userId, status: 'JOINED' }
        }
      }
    });
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const joinChallenge = async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user.uid;
  try {
    const participant = await prisma.challengeParticipant.create({
      data: { challengeId, userId }
    });
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, xp: true, level: true },
      orderBy: [
        { level: 'desc' },
        { xp: 'desc' }
      ],
      take: 10
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChallenges, createChallenge, joinChallenge, getLeaderboard };
