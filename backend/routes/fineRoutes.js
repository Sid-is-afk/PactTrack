const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');

router.get('/user/:userId', fineController.getFinesByUser);
router.delete('/:id', fineController.deleteFine);

module.exports = router;
