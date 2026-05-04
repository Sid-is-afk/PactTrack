const express = require('express');
const router = express.Router();
const piggyBankController = require('../controllers/piggyBankController');

router.get('/user/:userId', piggyBankController.getPiggyBankByUser);
router.post('/purpose', piggyBankController.setPiggyBankPurpose);

module.exports = router;
