import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Comment, Post } from '@/types';

interface PostState {
  posts: Post[];
}

const initialState: PostState = {
  posts: [],
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setPost: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },

    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },

    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },

    likeDislike: (
      state,
      action: PayloadAction<{ postId: string; userId: string }>
    ) => {
      const post = state.posts.find(
        (post) => post._id === action.payload.postId
      );
      if (post) {
        if (post.likes.includes(action.payload.userId)) {
          post.likes = post.likes.filter((id) => id !== action.payload.userId);
        } else {
          post.likes.push(action.payload.userId);
        }
      }
    },

    addComment: (
      state,
      action: PayloadAction<{ postId: string; comment: Comment }>
    ) => {
      const post = state.posts.find(
        (post) => post._id === action.payload.postId
      );
      if (post) {
        post.comments.push(action.payload.comment);
      }
    },
  },
});

export const { setPost, addPost, deletePost, likeDislike, addComment } =
  postSlice.actions;

export default postSlice.reducer;
