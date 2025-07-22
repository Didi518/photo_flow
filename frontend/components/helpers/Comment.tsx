'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import type { Post, User } from '@/types';

import { Button } from '../ui/button';
import { addCommentApi } from '../utils/commentApi';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

import DotButton from './DotButton';
import { handleAuthRequest } from '../utils/apiRequest';
import { addComment } from '@/store/postSlice';
import { toast } from 'sonner';

type Props = {
  user: User | null;
  post: Post | null;
};

const Comment = ({ user, post }: Props) => {
  const dispatch = useDispatch();
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addCommentHandler = async (id: string) => {
    if (!comment) return;
    const addCommentReq = async () => await addCommentApi(id, comment);
    const result = await handleAuthRequest(addCommentReq, setIsLoading);
    if (result?.data.status === 'success') {
      dispatch(addComment({ postId: id, comment: result?.data.data.comment }));
      setComment('');
      toast.success(result.data.message || 'Commentaire posté.');
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <p className="mt-2 font-semibold text-sm">
            Voir {post?.comments.length}{' '}
            {(post?.comments?.length ?? 0) <= 1
              ? 'commentaire'
              : 'commentaires'}
          </p>
        </DialogTrigger>
        <DialogContent className="w-full max-w-none sm:max-w-5xl p-0 gap-0 flex flex-col">
          <DialogTitle></DialogTitle>
          <div className="flex flex-1">
            <div className="sm:w-1/2 hidden max-h-[80vh] sm:block">
              <Image
                src={`${post?.image?.url}`}
                alt={`${post?.caption}`}
                width={300}
                height={300}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="w-full sm:w-1/2 flex flex-col justify-between">
              <div className="flex items-center mt-4 justify-between p-4">
                <div className="flex gap-3 items-center">
                  <Avatar>
                    <AvatarImage src={post?.user?.profilePicture} />
                    <AvatarFallback>
                      {user?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">
                      {post?.user?.username}
                    </p>
                  </div>
                </div>
                <DotButton post={post} user={user} />
              </div>
              <hr />
              <div className="flex-1 overflow-y-auto max-h-96 p-4">
                {post?.comments.map((comment) => {
                  return (
                    <div
                      key={comment._id}
                      className="flex mb-4 gap-3 items-center"
                    >
                      <Avatar>
                        <AvatarImage src={comment?.user?.profilePicture} />
                        <AvatarFallback>
                          {comment?.user?.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold">
                          {comment?.user?.username}
                        </p>
                        <p className="font-normal text-sm">{comment?.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      !isLoading && post?._id && addCommentHandler(post._id)
                    }
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comment;
