const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const { name, email } = req.body;
  const uid = req.user.uid;
  try {
    const user = await prisma.user.upsert({
      where: { id: uid },
      update: { name, email },
      create: { id: uid, name, email },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tasks: true,
        goals: true,
        taskLogs: true,
        fines: true,
        piggyBanks: true,
        reactions: true,
        comments: true,
        weeklyResults: true,
        achievements: true,
        challenges: {
          include: { challenge: true }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, theme, lastResetDate } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, theme, lastResetDate },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSharedDashboard = async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user.uid;

  try {
    // Verify friendship exists and is ACCEPTED
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId }
        ]
      }
    });

    if (!friendship) {
      return res.status(403).json({ error: 'Forbidden: You must be confirmed friends to view this dashboard.' });
    }

    // Enforce mutual dashboard sharing consent
    if (!friendship.requesterSharesDashboard || !friendship.addresseeSharesDashboard) {
      return res.status(403).json({
        error: 'Dashboard sharing is not mutually enabled. Both friends must agree to share their dashboards.',
        sharingStatus: {
          requesterShares: friendship.requesterSharesDashboard,
          addresseeShares: friendship.addresseeSharesDashboard
        }
      });
    }

    // Fetch friend's public data
    const friendData = await prisma.user.findUnique({
      where: { id: friendId },
      include: {
        tasks: {
          where: { isPrivate: false }
        },
        goals: true,
        taskLogs: {
          where: { task: { isPrivate: false } }
        },
        fines: {
          where: { taskLog: { task: { isPrivate: false } } }
        },
        piggyBanks: true,
      }
    });

    if (!friendData) return res.status(404).json({ error: 'Friend not found' });
    
    // Omit sensitive data like email
    const { email, ...safeData } = friendData;
    res.json(safeData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchUserByEmail = async (req, res) => {
  const { email } = req.query;
  const userId = req.user.uid;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email query parameter is required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'No user found with that email.' });
    }

    if (user.id === userId) {
      return res.status(400).json({ error: 'You cannot search for yourself.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  getSharedDashboard,
  searchUserByEmail,
};
