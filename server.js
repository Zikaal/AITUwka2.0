const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

dotenv.config();

const app = express();
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Определение схем и моделей ---

// Схема пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

// Схема поста
const postSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  content:  { type: String, required: true },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:{ type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Схема комментария
const commentSchema = new mongoose.Schema({
  post:     { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  text:     { type: String, required: true },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:{ type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', commentSchema);

// --- JOI-схемы для валидации ---

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const postValidationSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required()
});

const commentValidationSchema = Joi.object({
  text: Joi.string().required()
});

// --- Middleware для аутентификации ---

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// --- Роуты ---

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    // Проверка на существование пользователя с таким же email или username
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    const savedUser = await user.save();
    res.status(201).json({ id: savedUser._id, username: savedUser.username, email: savedUser.email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });
    
    const role = user.role;
    const userId = user._id;
    const tokenPayload = { id: userId, role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, role, id: userId });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Получение профиля текущего пользователя
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email role');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Profile retrieval error:', err);
    res.status(500).json({ message: 'Server error retrieving profile.' });
  }
});

// Обновление профиля пользователя (только владелец или админ)
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this profile.' });
  }

  const { username, email, password } = req.body;
  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (password) {
    try {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    } catch (err) {
      console.error('Password hashing error:', err);
      return res.status(500).json({ message: 'Error hashing password.' });
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });
    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Получение списка пользователей (только для аутентифицированных)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('username email role');
    res.json(users);
  } catch (err) {
    console.error('Fetching users error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Создание нового поста (только для аутентифицированных)
app.post('/api/posts', authMiddleware, async (req, res) => {
  const { error } = postValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      owner: req.user.id
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Creating post error:', err);
    res.status(500).json({ message: 'Server error creating post.' });
  }
});

// Получение всех постов с информацией об авторе
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Fetching posts error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Поиск постов по username
// Поиск постов по username (регистронезависимо)
app.get('/api/posts/search', async (req, res) => {
  try {
    let username = req.query.username;
    if (!username) {
      return res.status(400).json({ message: 'Username query parameter is required.' });
    }
    // Убираем кавычки, если они есть (на всякий случай)
    username = username.replace(/"/g, '');
    // Поиск пользователя по имени (регистронезависимо)
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) return res.json([]); // Если пользователь не найден, возвращаем пустой массив

    const posts = await Post.find({ owner: user._id })
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });
    
    res.set('Cache-Control', 'no-store'); // отключаем кэширование
    res.json(posts);
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({ message: err.message });
  }
});



app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // Проверяем, что пользователь — владелец поста или админ
    if (req.user.role !== 'admin' && String(post.owner) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post.' });
    }

    // Обновляем только те поля, которые пришли в body
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;

    await post.save();
    return res.json({ message: 'Post updated successfully.' });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ message: 'An error occurred while updating the post.' });
  }
});


// Удаление поста (только владелец или админ)
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (req.user.role !== 'admin' && post.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Deleting post error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Добавление комментария к посту (только для аутентифицированных)
app.post('/api/posts/:id/comments', authMiddleware, async (req, res) => {
  const { error } = commentValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const newComment = new Comment({
      post: req.params.id,
      text: req.body.text,
      owner: req.user.id
    });
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    console.error('Creating comment error:', err);
    res.status(500).json({ message: 'Server error creating comment.' });
  }
});

// Получение комментариев для поста
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('owner', 'username email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('Fetching comments error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Обновление комментария (PUT /api/posts/:postId/comments/:commentId)
app.put('/api/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { error } = commentValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    // Ищем комментарий по ID
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    // Проверяем, что комментарий принадлежит указанному посту
    if (comment.post.toString() !== req.params.postId) {
      return res.status(400).json({ message: 'Comment does not belong to this post.' });
    }

    // Если пользователь не админ, проверяем, что он является владельцем комментария
    if (req.user.role !== 'admin' && (!comment.owner || comment.owner.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this comment.' });
    }

    // Обновляем текст комментария
    comment.text = req.body.text;
    await comment.save();
    res.json({ message: 'Comment updated successfully.', comment });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ message: 'Server error updating comment.' });
  }
});

// Удаление комментария (DELETE /api/posts/:postId/comments/:commentId)
app.delete('/api/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    // Ищем комментарий
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    // Проверяем, что комментарий принадлежит указанному посту
    if (comment.post.toString() !== req.params.postId) {
      return res.status(400).json({ message: 'Comment does not belong to this post.' });
    }

    // Если пользователь не админ, проверяем, что он является владельцем комментария
    if (req.user.role !== 'admin' && (!comment.owner || comment.owner.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Server error deleting comment.' });
  }
});


// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Статическая раздача файлов для клиентской части
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
