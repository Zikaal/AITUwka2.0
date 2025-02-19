const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Обновление профиля
router.put('/:id', authMiddleware, userController.updateUser);

// Получение списка пользователей
router.get('/', authMiddleware, userController.getAllUsers);

module.exports = router;
