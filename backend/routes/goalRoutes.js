const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.get('/user/:userId', goalController.getGoalsByUser);
router.post('/', goalController.createGoal);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/:id/toggle-log', goalController.toggleGoalLog);

module.exports = router;
