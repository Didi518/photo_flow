const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      maxlength: [2200, 'La légende ne doit pas dépasser 2200 caractères'],
      trim: true,
    },
    image: {
      url: { type: String, required: true },
      publicId: {
        type: String,
        required: true,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utilisateur est requis."],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
