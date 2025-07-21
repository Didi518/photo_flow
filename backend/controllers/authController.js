const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const generateOtp = require('../utils/generateOtp');
const { createSendToken } = require('../utils/authHelpers');
const { emailTemplates } = require('../utils/templateHelpers');
const {
  validatePasswordStrength,
  validatePasswordMatch,
  validateOtp,
} = require('../utils/validators');

exports.signUp = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, username } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new AppError('Un utilisateur avec cet e-mail existe déjà', 400)
    );
  }

  validatePasswordStrength(password);
  validatePasswordMatch(password, passwordConfirm);

  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    otp,
    otpExpires,
  });

  const htmlTemplate = emailTemplates.verification(newUser.username, otp);

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Vérification de l'e-mail",
      html: htmlTemplate,
    });

    createSendToken(
      newUser,
      201,
      res,
      'Inscription réussie, veuillez vérifier votre e-mail pour le code de vérification.'
    );
  } catch (error) {
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError(
        "Une erreur s'est produite lors de la création du compte. Veuillez réessayer plus tard!",
        500
      )
    );
  }
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  validateOtp(otp);

  const user = req.user;

  if (!user.otp || !user.otpExpires) {
    return next(
      new AppError(
        'Aucun code de vérification trouvé. Veuillez demander un nouveau code.',
        400
      )
    );
  }

  if (Date.now() > user.otpExpires) {
    return next(
      new AppError(
        'Le code de vérification a expiré. Veuillez demander un nouveau code.',
        400
      )
    );
  }

  if (user.otp !== otp.toString()) {
    return next(new AppError('Code de vérification incorrect.', 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, 'Compte vérifié avec succès. Bienvenue !');
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.user;
  if (!email) {
    return next(new AppError("L'email est requis.", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('Utilisateur introuvable.', 404));
  }

  if (user.isVerified) {
    return next(new AppError('Votre compte est déjà vérifié.', 400));
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save({ validateBeforeSave: false });

  const htmlTemplate = emailTemplates.verification(user.username, otp);

  try {
    await sendEmail({
      email: user.email,
      subject: "Nouveau code pour la vérification de l'e-mail",
      html: htmlTemplate,
    });

    res.status(200).json({
      status: 'success',
      message: 'Un nouveau code de vérification a été envoyé à votre e-mail.',
    });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "Une erreur s'est produite lors de l'envoi du code de vérification. Veuillez réessayer plus tard.",
        500
      )
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError('Veuillez saisir un e-mail et un mot de passe.', 400)
    );
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('E-mail ou mot de passe incorrect.', 401));
  }

  createSendToken(user, 200, res, 'Connexion réussie.');
});

exports.logout = catchAsync(async (_req, res, _next) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status: 'success',
    message: 'Déconnexion réussie.',
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reinitialiser-mdp?token=${resetToken}`;
    const htmlTemplate = emailTemplates.passwordReset(user.username, resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Réinitialisation du mot de passe',
        html: htmlTemplate,
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "Une erreur s'est produite lors de l'envoi de l'e-mail. Veuillez réessayer plus tard.",
          500
        )
      );
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Si cet e-mail existe, un lien de réinitialisation a été envoyé.',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password, passwordConfirm } = req.body;

  validatePasswordStrength(password);
  validatePasswordMatch(password, passwordConfirm);

  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return next(
      new AppError('Lien de réinitialisation invalide ou expiré.', 400)
    );
  }

  if (await user.correctPassword(password, user.password)) {
    return next(
      new AppError(
        "Le nouveau mot de passe doit être différent de l'ancien.",
        400
      )
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(
    user,
    200,
    res,
    'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
  );
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const { email } = req.user;

  validatePasswordStrength(newPassword);
  validatePasswordMatch(newPassword, newPasswordConfirm);

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Utilisateur introuvable.', 404));
  }

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Mot de passe actuel incorrect.', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  createSendToken(user, 200, res, 'Mot de passe modifié avec succès.');
});
