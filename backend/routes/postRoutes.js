const express = require('express');

const upload = require('../middlewares/multer');
const isAuthenticated = require('../middlewares/isAuthenticated');
const {
  createPost,
  getAllPosts,
  getUserPosts,
  saveUnsavePost,
  deletePost,
} = require('../controllers/postController');

const router = express.Router();

router.post(
  '/create/post',
  isAuthenticated,
  upload.single('image'),
  createPost
);
router.get('/all', getAllPosts);
router.get('/user-posts/:id', getUserPosts);
router.patch('/save-unsave-post/:postId', isAuthenticated, saveUnsavePost);
router.delete('/delete-post/:id', isAuthenticated, deletePost);

module.exports = router;
