const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// Создание нового поста
router.post('/', authMiddleware, postController.createPost);

// Получение всех постов
router.get('/', postController.getAllPosts);

// Поиск постов по username
router.get('/search', postController.searchPosts);

// Обновление поста
router.put('/:id', authMiddleware, postController.updatePost);

// Удаление поста
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
