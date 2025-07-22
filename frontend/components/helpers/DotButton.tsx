'use client';

import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { EllipsisIcon } from 'lucide-react';

import { BASE_API_URL } from '@/server';
import type { Post, User } from '@/types';

import { Button } from '../ui/button';
import { useFollowUnfollow } from '../hooks/use-auth';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { handleAuthRequest } from '../utils/apiRequest';
import { deletePost, setPost } from '@/store/postSlice';

type Props = {
  post: Post | null;
  user: User | null;
};

const DotButton = ({ post, user }: Props) => {
  const dispatch = useDispatch();
  const [, setIsLoading] = useState(false);
  const { handleFollowUnfollow, isLoading: handleFollowUnfollowLoading } =
    useFollowUnfollow();

  const isOwnPost = post?.user?._id === user?._id;
  const isFollowing = post?.user?._id
    ? user?.following.includes(post.user._id)
    : false;

  const handleDeletePost = async () => {
    const deletePostReq = async () =>
      await axios.delete(`${BASE_API_URL}/posts/delete-post/${post?._id}`, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(deletePostReq, setIsLoading);
    if (result?.data.status === 'success' || result?.status === 204) {
      if (post?._id) {
        dispatch(deletePost(post._id));
        toast.success(result.data.message || 'Post supprimé.');
        const getAllPostsReq = async () =>
          await axios.get(`${BASE_API_URL}/posts/all`);
        const postsResult = await handleAuthRequest(
          getAllPostsReq,
          setIsLoading
        );
        if (postsResult) {
          dispatch(setPost(postsResult.data.data.posts));
        }
      }
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <EllipsisIcon className="w-8 h-8 text-black" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <div className="space-y-4 flex flex-col w-fit justify-center items-center mx-auto">
            {!isOwnPost && (
              <div>
                <Button
                  onClick={() => {
                    if (post?.user?._id) {
                      if (!handleFollowUnfollowLoading) {
                        handleFollowUnfollow(post.user._id);
                      }
                    }
                  }}
                  variant={isFollowing ? 'destructive' : 'secondary'}
                >
                  {isFollowing ? 'Se désabonner' : "S'abonner"}
                </Button>
              </div>
            )}
            <Link href={`/profil/${post?.user?._id}`}>
              <Button variant="secondary">Infos sur ce compte</Button>
            </Link>
            {isOwnPost && (
              <Button variant="destructive" onClick={() => handleDeletePost()}>
                Supprimer Post
              </Button>
            )}
            <DialogClose>Annuler</DialogClose>{' '}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DotButton;
