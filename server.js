const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// Роуты
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
app.use(express.json())

// Подключаем базу
connectDB();

// Используем роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes); // здесь /api/posts уже в postRoutes, но comments тоже нужны

// Глобальный обработчик ошибок (при желании - отдельный middleware)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Статическая раздача файлов для клиентской части
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
