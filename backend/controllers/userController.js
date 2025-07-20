const User = require('../models/userModel');
const AppError = require('../utils/appError');
const getDataUri = require('../utils/dataUri');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select(
      '-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires -passwordConfirm'
    )
    .populate({
      path: 'posts',
      options: { sort: { createdAt: -1 } },
    })
    .populate({
      path: 'savedPosts',
      options: { sort: { createdAt: -1 } },
    });

  if (!user) {
    return next(new AppError('Utilisateur introuvable.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { bio } = req.body;
  const profilePicture = req.file;

  let cloudResponse;

  const user = await User.findById(userId).select('-password');
  if (!user) return next(new AppError('Utilisateur introuvable.', 404));

  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    try {
      cloudResponse = await uploadToCloudinary(fileUri);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return next(
        new AppError(
          "Echec lors de l'upload de l'image. Veuillez réessayer plus tard.",
          500
        )
      );
    }
  }

  if (bio) user.bio = bio;

  if (profilePicture && cloudResponse?.secure_url)
    user.profilePicture = cloudResponse.secure_url;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: 'success',
    message: 'Profil mis à jour avec succès.',
    data: {
      user,
    },
  });
});

exports.suggestedUsers = catchAsync(async (req, res, _next) => {
  const loginUserId = req.user.id;
  const users = await User.find({ _id: { $ne: loginUserId } }).select(
    '-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires -passwordConfirm'
  );

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.followUnfollow = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;
  const targetUserId = req.params.id;

  if (loginUserId.toString() === targetUserId.toString()) {
    return next(
      new AppError(
        'Vous ne pouvez pas vous suivre ou ne plus vous suivre vous-même.',
        400
      )
    );
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return next(new AppError('Utilisateur introuvable.', 404));
  }

  const isFollowing = targetUser.followers.some((followerId) =>
    followerId.equals(loginUserId)
  );
  if (isFollowing) {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $pull: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $pull: { followers: loginUserId } }
      ),
    ]);
  } else {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $addToSet: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: loginUserId } }
      ),
    ]);
  }

  const updatedLoggedInUser = await User.findById(loginUserId).select(
    '-password'
  );

  res.status(200).json({
    status: 'success',
    message: isFollowing
      ? 'Vous ne suivez plus cet utilisateur.'
      : 'Vous suivez maintenant cet utilisateur.',
    data: {
      user: updatedLoggedInUser,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError('Utilisateur non connecté.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Utilisateur en ligne.',
    data: {
      user,
    },
  });
});
