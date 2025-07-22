const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Merci de saisir un nom d'utilisateur"],
      unique: true,
      trim: true,
      minlength: [
        3,
        "Le nom d'utilisateur doit comporter au moins 3 caractères",
      ],
      maxlength: [
        30,
        "Le nom d'utilisateur ne doit pas dépasser 30 caractères",
      ],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Merci de saisir une adresse e-mail'],
      unique: true,
      lowercase: true,
      validate: [
        validator.isEmail,
        'Veuillez saisir une adresse e-mail valide',
      ],
    },
    password: {
      type: String,
      required: [true, 'Merci de saisir un mot de passe'],
      minlength: [8, 'Le mot de passe doit comporter au moins 8 caractères'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Merci de confirmer votre mot de passe'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Les mots de passe ne correspondent pas',
      },
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: [150, 'La biographie ne doit pas dépasser 150 caractères'],
      default: '',
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  userPassword,
  databasePassword
) {
  return await bcrypt.compare(userPassword, databasePassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
