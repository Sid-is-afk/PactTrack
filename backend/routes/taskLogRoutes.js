const express = require('express');
const router = express.Router();
const taskLogController = require('../controllers/taskLogController');

router.get('/user/:userId', taskLogController.getTaskLogsByUser);
router.post('/status', taskLogController.setTaskStatus);
router.put('/:id/carry-forward', taskLogController.carryForwardTask);

module.exports = router;
