const express = require('express');
const router = express.Router();
const { getAchievements } = require('../controllers/achievementController');
const { getChallenges, createChallenge, joinChallenge, getLeaderboard } = require('../controllers/challengeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/achievements', getAchievements);
router.get('/challenges', getChallenges);
router.post('/challenges', createChallenge);
router.post('/challenges/:challengeId/join', joinChallenge);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
