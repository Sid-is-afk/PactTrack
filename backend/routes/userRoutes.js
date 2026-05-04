const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/search', userController.searchUserByEmail);
router.get('/:friendId/shared-dashboard', userController.getSharedDashboard);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

module.exports = router;
