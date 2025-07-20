const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const isAuthenticated = catchAsync(async (req, _res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(
      new AppError(
        'Vous devez être connecté pour accéder à cette ressource.',
        401
      )
    );
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const currentUser = await User.findById(decodedToken.id);
    if (!currentUser) {
      return next(
        new AppError("L'utilisateur associé à ce token n'existe pas.", 401)
      );
    }

    req.user = currentUser;

    next();
  } catch (error) {
    return next(
      new AppError('Token invalide ou expiré. Veuillez vous reconnecter.', 401)
    );
  }
});

module.exports = isAuthenticated;
