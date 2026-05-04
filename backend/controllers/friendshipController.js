const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendRequest = async (req, res) => {
  const requesterId = req.user.uid;
  const { addresseeId } = req.body; // Needs to be the target user's Firebase UID

  if (requesterId === addresseeId) {
    return res.status(400).json({ error: "You cannot send a friend request to yourself." });
  }

  try {
    // Check if the addressee exists
    const addresseeExists = await prisma.user.findUnique({ where: { id: addresseeId } });
    if (!addresseeExists) {
      return res.status(404).json({ error: "Target user not found." });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: "PENDING"
      }
    });
    res.status(201).json(friendship);
  } catch (error) {
    // Handle unique constraint violation (request already exists)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "A friendship request already exists between these users." });
    }
    res.status(500).json({ error: error.message });
  }
};

const acceptRequest = async (req, res) => {
  const { id } = req.params; // Friendship ID
  const userId = req.user.uid;

  try {
    // Ensure the friendship exists and the current user is the addressee
    const friendship = await prisma.friendship.findUnique({ where: { id } });
    
    if (!friendship) return res.status(404).json({ error: "Friendship request not found." });
    if (friendship.addresseeId !== userId) return res.status(403).json({ error: "Unauthorized to accept this request." });
    if (friendship.status !== "PENDING") return res.status(400).json({ error: "Request is not in a pending state." });

    const updated = await prisma.friendship.update({
      where: { id },
      data: { status: "ACCEPTED" }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectRequest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    const friendship = await prisma.friendship.findUnique({ where: { id } });
    
    if (!friendship) return res.status(404).json({ error: "Friendship request not found." });
    if (friendship.addresseeId !== userId && friendship.requesterId !== userId) {
      return res.status(403).json({ error: "Unauthorized to modify this request." });
    }

    // We can either update status to REJECTED or delete it. Deleting allows them to try again later.
    const updated = await prisma.friendship.update({
      where: { id },
      data: { status: "REJECTED" }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFriends = async (req, res) => {
  const userId = req.user.uid;

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      include: {
        requester: true,
        addressee: true
      }
    });

    // Map friendships to return the friend's user object + friendshipId
    const friends = friendships.map(f => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        ...friend,
        friendshipId: f.id,
        requesterSharesDashboard: f.requesterSharesDashboard,
        addresseeSharesDashboard: f.addresseeSharesDashboard,
        isRequester: f.requesterId === userId,
      };
    });

    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  const userId = req.user.uid;

  try {
    const requests = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: "PENDING"
      },
      include: {
        requester: true
      }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFriend = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    const friendship = await prisma.friendship.findUnique({ where: { id } });
    if (!friendship) return res.status(404).json({ error: "Friendship not found." });

    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      return res.status(403).json({ error: "Unauthorized to remove this friendship." });
    }

    await prisma.friendship.delete({ where: { id } });
    res.json({ message: "Friendship removed successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleDashboardShare = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;
  const { share } = req.body; // Expect boolean: true to enable, false to revoke

  if (typeof share !== 'boolean') {
    return res.status(400).json({ error: "'share' must be a boolean value." });
  }

  try {
    const friendship = await prisma.friendship.findUnique({ where: { id } });
    if (!friendship) return res.status(404).json({ error: "Friendship not found." });

    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      return res.status(403).json({ error: "Unauthorized to modify this friendship." });
    }

    if (friendship.status !== "ACCEPTED") {
      return res.status(400).json({ error: "You can only toggle dashboard sharing for accepted friendships." });
    }

    // Determine which field to update based on who is making the request
    const isRequester = friendship.requesterId === userId;
    const updateData = isRequester
      ? { requesterSharesDashboard: share }
      : { addresseeSharesDashboard: share };

    const updated = await prisma.friendship.update({
      where: { id },
      data: updateData
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getFriends,
  getPendingRequests,
  removeFriend,
  toggleDashboardShare
};
