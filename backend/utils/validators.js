const AppError = require('./appError');
const {
  passwordStrengthRegex,
  passwordStrengthErrorMessage,
} = require('../constants/regex');

const validatePasswordStrength = (password) => {
  if (!passwordStrengthRegex.test(password)) {
    throw new AppError(passwordStrengthErrorMessage, 400);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Format d'email invalide.", 400);
  }
};

const validatePasswordMatch = (password, passwordConfirm) => {
  if (password !== passwordConfirm) {
    throw new AppError('Les mots de passe ne correspondent pas.', 400);
  }
};

const validateOtp = (otp) => {
  if (!otp || otp.toString().length !== 6 || isNaN(otp)) {
    throw new AppError(
      'Veuillez fournir un code de vérification à 6 chiffres valide.',
      400
    );
  }
};

module.exports = {
  validatePasswordStrength,
  validateEmail,
  validatePasswordMatch,
  validateOtp,
};
