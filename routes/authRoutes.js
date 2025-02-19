const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Регистрация
router.post('/register', authController.register);

// Логин
router.post('/login', authController.login);

// Профиль (требуется токен)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
