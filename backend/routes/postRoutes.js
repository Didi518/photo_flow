const express = require('express');

const upload = require('../middlewares/multer');
const isAuthenticated = require('../middlewares/isAuthenticated');
const {
  createPost,
  getAllPosts,
  getUserPosts,
  saveUnsavePost,
  deletePost,
  likeDislike,
  addComment,
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
router.patch('/like-unlike-post', isAuthenticated, likeDislike);
router.post('/comment/:id', isAuthenticated, addComment);

module.exports = router;
