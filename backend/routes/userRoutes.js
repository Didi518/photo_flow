const express = require('express');

const upload = require('../middlewares/multer');
const isAuthenticated = require('../middlewares/isAuthenticated');
const {
  getProfile,
  editProfile,
  suggestedUsers,
  followUnfollow,
  getMe,
} = require('../controllers/userController');
const {
  signUp,
  verifyAccount,
  resendOtp,
  login,
  logout,
  forgetPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/verify', isAuthenticated, verifyAccount);
router.post('/resend-otp', isAuthenticated, resendOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.patch('/change-password', isAuthenticated, changePassword);

router.get('/profile/:id', isAuthenticated, getProfile);
router.patch(
  '/edit-profile',
  isAuthenticated,
  upload.single('profilePicture'),
  editProfile
);
router.get('/suggested-users', isAuthenticated, suggestedUsers);
router.post('/follow-unfollow/:id', isAuthenticated, followUnfollow);
router.get('/me', isAuthenticated, getMe);

module.exports = router;
