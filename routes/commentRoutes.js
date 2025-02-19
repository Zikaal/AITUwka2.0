const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Добавление комментария
router.post('/:id/comments', authMiddleware, commentController.createComment);

// Получение комментариев
router.get('/:id/comments', commentController.getComments);

// Обновление комментария
router.put('/:postId/comments/:commentId', authMiddleware, commentController.updateComment);

// Удаление комментария
router.delete('/:postId/comments/:commentId', authMiddleware, commentController.deleteComment);

module.exports = router;
