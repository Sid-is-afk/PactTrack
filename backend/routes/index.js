const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const taskLogRoutes = require('./taskLogRoutes');
const goalRoutes = require('./goalRoutes');
const friendshipRoutes = require('./friendshipRoutes');
const fineRoutes = require('./fineRoutes');
const piggyBankRoutes = require('./piggyBankRoutes');
const reactionRoutes = require('./reactionRoutes');
const commentRoutes = require('./commentRoutes');
const weeklyResultRoutes = require('./weeklyResultRoutes');
const gamificationRoutes = require('./gamificationRoutes');

const { verifyToken } = require('../middleware/authMiddleware');

router.use('/users', verifyToken, userRoutes);
router.use('/tasks', verifyToken, taskRoutes);
router.use('/task-logs', verifyToken, taskLogRoutes);
router.use('/goals', verifyToken, goalRoutes);
router.use('/friendships', verifyToken, friendshipRoutes);
router.use('/fines', verifyToken, fineRoutes);
router.use('/piggy-banks', verifyToken, piggyBankRoutes);
router.use('/reactions', verifyToken, reactionRoutes);
router.use('/comments', verifyToken, commentRoutes);
router.use('/weekly-results', verifyToken, weeklyResultRoutes);
router.use('/gamification', gamificationRoutes);

module.exports = router;
