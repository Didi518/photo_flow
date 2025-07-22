'use client';

import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookmarkIcon,
  HeartIcon,
  LoaderIcon,
  MessageCircleIcon,
} from 'lucide-react';

import { BASE_API_URL } from '@/server';
import type { RootState } from '@/store/store';
import { setAuthUser } from '@/store/authSlice';
import { addComment, likeDislike, setPost } from '@/store/postSlice';

import Comment from '../helpers/Comment';
import DotButton from '../helpers/DotButton';
import { addCommentApi } from '../utils/commentApi';
import { handleAuthRequest } from '../utils/apiRequest';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.posts.posts);
  const [comment, setComment] = useState<{ [postId: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAllPosts = async () => {
      const getAllPostsReq = async () =>
        await axios.get(`${BASE_API_URL}/posts/all`);

      const result = await handleAuthRequest(getAllPostsReq, setIsLoading);
      if (result) {
        dispatch(setPost(result.data.data.posts));
      }
    };

    getAllPosts();
  }, [dispatch]);

  const handleLikeDislike = async (id: string) => {
    const result = await axios.patch(
      `${BASE_API_URL}/posts/like-dislike/${id}`,
      {},
      { withCredentials: true }
    );

    if (result.data.status === 'success') {
      if (user?._id) {
        dispatch(likeDislike({ postId: id, userId: user?._id }));
        toast.success(result.data.message);
      }
    }
  };

  const handleSaveUnsave = async (id: string) => {
    const result = await axios.patch(
      `${BASE_API_URL}/posts/save-unsave-post/${id}`,
      {},
      {
        withCredentials: true,
      }
    );

    if (result.data.status === 'success') {
      if (user?._id) {
        dispatch(setAuthUser(result.data.data.user));
        toast.success(result.data.message);
      }
    }
  };

  const handleComment = async (id: string) => {
    if (!comment[id]) return;

    const addCommentReq = async () => await addCommentApi(id, comment[id]);
    const result = await handleAuthRequest(addCommentReq, setIsLoading);
    if (result?.data.status === 'success') {
      dispatch(addComment({ postId: id, comment: result?.data.data.comment }));
      toast.success(result.data.message || 'Commentaire posté.');
      setComment({ ...comment, [id]: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="text-3xl m-8 text-center capitalize font-bold">
        Aucun post disponible.
      </div>
    );
  }

  return (
    <div className="mt-20 w-[70%] mx-auto">
      {posts.map((post) => {
        return (
          <div key={post._id} className="mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={post.user?.profilePicture}
                    className="w-full h-full"
                  />
                  <AvatarFallback className="text-lg">
                    {post.user?.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h1>{post.user?.username}</h1>
              </div>
              <DotButton post={post} user={user} />
            </div>
            <div className="mt-2">
              <Image
                src={`${post.image?.url}`}
                alt={`${post.caption}`}
                width={400}
                height={400}
                className="w-full"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <HeartIcon
                  onClick={() => !isLoading && handleLikeDislike(post._id)}
                  className={`cursor-pointer transition-transform duration-150 hover:scale-110 ${
                    user?._id && post.likes.includes(user?._id)
                      ? 'text-red-500'
                      : ''
                  }`}
                />
                <MessageCircleIcon className="cursor-pointer" />
              </div>
              <BookmarkIcon
                onClick={() => !isLoading && handleSaveUnsave(post?._id)}
                className={`cursor-pointer transition-transform duration-150 hover:scale-110 ${
                  (user?.savedPosts as string[])?.some(
                    (savePostId: string) => savePostId === post._id
                  )
                    ? 'text-red-500'
                    : ''
                }`}
              />
            </div>
            <h1 className="mt-2 text-sm font-semibold">
              {post.likes.length} J&apos;aime
            </h1>
            <p className="mt-2 font-medium">
              {post.caption || 'Aucune description'}
            </p>
            <Comment post={post} user={user} />
            <div className="mt-2 flex items-center">
              <input
                type="text"
                placeholder="Ajouter un Commentaire..."
                className="flex-1 placeholder:text-gray-800 outline-none"
                value={comment[post._id] || ''}
                onChange={(e) =>
                  setComment({ ...comment, [post._id]: e.target.value })
                }
              />
              <p
                role="button"
                className="text-sm font-semibold text-blue-700 cursor-pointer"
                onClick={() => {
                  handleComment(post._id);
                }}
              >
                Commenter
              </p>
            </div>
            <div className="pb-6 border-b-2"></div>
          </div>
        );
      })}
    </div>
  );
};

export default Feed;
