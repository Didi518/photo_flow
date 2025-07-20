const passwordStrengthRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const passwordStrengthErrorMessage =
  'Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.';

module.exports = { passwordStrengthRegex, passwordStrengthErrorMessage };
