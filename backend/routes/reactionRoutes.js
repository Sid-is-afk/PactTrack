const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactionController');

router.post('/toggle', reactionController.toggleReaction);

module.exports = router;
