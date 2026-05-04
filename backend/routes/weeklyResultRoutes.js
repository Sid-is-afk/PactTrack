const express = require('express');
const router = express.Router();
const weeklyResultController = require('../controllers/weeklyResultController');

router.get('/user/:userId', weeklyResultController.getWeeklyResultsByUser);
router.post('/', weeklyResultController.addWeeklyResult);

module.exports = router;
