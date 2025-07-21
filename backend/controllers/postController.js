const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

const Post = require('../models/postModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Comment = require('../models/commentModel');
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;
  const image = req.file;
  const userId = req.user._id;
  let post;

  if (!image) return next(new AppError("L'image est requise.", 400));

  const isPng = image.mimetype.includes('png');
  const outputFormat = isPng ? 'png' : 'jpeg';

  const optimizedImageBuffer = await sharp(image.buffer)
    .rotate()
    .resize({
      width: 800,
      height: 800,
      fit: 'inside',
    })
    .toFormat(outputFormat, { quality: 80 })
    .toBuffer();

  const fileUri = `data:image/${outputFormat};base64,${optimizedImageBuffer.toString(
    'base64'
  )}`;

  try {
    const cloudResponse = await uploadToCloudinary(fileUri);
    post = await Post.create({
      caption,
      image: {
        url: cloudResponse.secure_url,
        publicId: cloudResponse.public_id,
      },
      user: userId,
    });
  } catch (error) {
    return next(new AppError("Erreur lors du téléchargement de l'image.", 500));
  }

  const user = await User.findById(userId);
  if (user) {
    user.posts.push(post._id);
    await user.save({ validateBeforeSave: false });
  }

  post = await post.populate({
    path: 'user',
    select: 'username email bio profilePicture',
  });

  return res.status(201).json({
    status: 'success',
    message: 'Post créé avec succès.',
    data: {
      post,
    },
  });
});

exports.getAllPosts = catchAsync(async (_req, res, _next) => {
  const posts = await Post.find()
    .populate({
      path: 'user',
      select: 'username bio profilePicture',
    })
    .populate({
      path: 'comments',
      select: 'text user',
      populate: {
        path: 'user',
        select: 'username profilePicture',
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.getUserPosts = catchAsync(async (req, res, _next) => {
  const userId = req.params.id;

  const posts = await Post.find({ user: userId })
    .populate({
      path: 'comments',
      select: 'text user',
      populate: {
        path: 'user',
        select: 'username profilePicture',
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.saveUnsavePost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('Utilisateur non trouvé.', 404));
  }

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post non trouvé.', 404));
  }

  const isPostSaved = user.savedPosts.includes(postId);
  if (isPostSaved) {
    user.savedPosts.pull(postId);

    await user.save({ validateBeforeSave: false });
  } else {
    user.savedPosts.push(postId);

    await user.save({ validateBeforeSave: false });
  }

  return res.status(200).json({
    status: 'success',
    message: isPostSaved
      ? 'Post retiré des favoris.'
      : 'Post ajouté aux favoris.',
    data: {
      user,
      savedPosts: user.savedPosts.length,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id).populate('user');
  if (!post) {
    return next(new AppError('Post non trouvé.', 404));
  }

  if (post.user._id.toString() !== userId.toString()) {
    return next(
      new AppError("Vous n'êtes pas autorisé à supprimer ce post.", 403)
    );
  }

  await User.updateOne({ _id: userId }, { $pull: { posts: id } });

  await User.updateMany({ savedPosts: id }, { $pull: { savedPosts: id } });

  await Comment.deleteMany({ post: id });

  if (post.image.publicId) {
    try {
      await cloudinary.uploader.destroy(post.image.publicId);
    } catch (error) {
      console.error('Erreur suppression Cloudinary:', error);
    }
  }

  await Post.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    message: 'Post supprimé avec succès.',
  });
});

exports.likeDislike = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) {
    return next(new AppError('Post non trouvé.', 404));
  }

  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    await Post.findByIdAndUpdate(
      id,
      { $pull: { likes: userId } },
      { new: true }
    );
  } else {
    await Post.findByIdAndUpdate(
      id,
      { $addToSet: { likes: userId } },
      { new: true }
    );
  }

  return res.status(200).json({
    status: 'success',
    message: isLiked ? 'Post retiré des likes.' : 'Post liké avec succès.',
  });
});

exports.addComment = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user._id;
  const { text } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError('Post non trouvé.', 404));
  }

  if (!text || text.trim() === '') {
    return next(new AppError('Le texte du commentaire est requis.', 400));
  }

  const comment = await Comment.create({
    text,
    user: userId,
    createdAt: Date.now(),
  });

  post.comments.push(comment);

  await post.save({ validateBeforeSave: false });

  await comment.populate({
    path: 'user',
    select: 'username bio profilePicture',
  });

  res.status(201).json({
    status: 'success',
    message: 'Commentaire ajouté avec succès.',
    data: {
      comment,
    },
  });
});
