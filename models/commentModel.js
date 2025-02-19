const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post:      { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  text:      { type: String, required: true },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
