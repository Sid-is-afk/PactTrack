const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');

// All these routes are protected by authMiddleware in index.js
router.post('/request', friendshipController.sendRequest);
router.put('/accept/:id', friendshipController.acceptRequest);
router.put('/reject/:id', friendshipController.rejectRequest);
router.delete('/:id', friendshipController.removeFriend);
router.put('/:id/toggle-share', friendshipController.toggleDashboardShare);
router.get('/', friendshipController.getFriends);
router.get('/pending', friendshipController.getPendingRequests);

module.exports = router;
