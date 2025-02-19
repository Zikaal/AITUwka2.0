const Post = require('../models/postModel');
const { postSchema } = require('../validations/schemas');

exports.createPost = async (req, res) => {
  const { error } = postSchema.validate(req.body);
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
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Fetching posts error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    let username = req.query.username;
    if (!username) {
      return res.status(400).json({ message: 'Username query parameter is required.' });
    }
    username = username.replace(/"/g, '');
    const User = require('../models/userModel');
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) return res.json([]);
    const posts = await Post.find({ owner: user._id })
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (req.user.role !== 'admin' && String(post.owner) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post.' });
    }
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    await post.save();
    res.json({ message: 'Post updated successfully.' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'An error occurred while updating the post.' });
  }
};

exports.deletePost = async (req, res) => {
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
};
