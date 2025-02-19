const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const { commentSchema } = require('../validations/schemas');

exports.createComment = async (req, res) => {
  const { error } = commentSchema.validate(req.body);
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
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('owner', 'username email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error('Fetching comments error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateComment = async (req, res) => {
  const { error } = commentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.post.toString() !== req.params.postId) {
      return res.status(400).json({ message: 'Comment does not belong to this post.' });
    }
    if (req.user.role !== 'admin' && (!comment.owner || comment.owner.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this comment.' });
    }
    comment.text = req.body.text;
    await comment.save();
    res.json({ message: 'Comment updated successfully.', comment });
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ message: 'Server error updating comment.' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });
    if (comment.post.toString() !== req.params.postId) {
      return res.status(400).json({ message: 'Comment does not belong to this post.' });
    }
    if (req.user.role !== 'admin' && (!comment.owner || comment.owner.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Server error deleting comment.' });
  }
};
