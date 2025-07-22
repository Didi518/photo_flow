import Image from 'next/image';
import { HeartIcon, MessageCircleIcon } from 'lucide-react';

import type { User } from '@/types';

type Props = {
  userProfile: User | undefined;
};

const Save = ({ userProfile }: Props) => {
  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {userProfile?.savedPosts?.map((post) => {
        if (typeof post === 'string') return null;
        return (
          <div key={post._id} className="relative group overflow-hidden">
            <Image
              src={`${post?.image?.url}`}
              alt={post?.caption}
              width={300}
              height={300}
              className="w-full h-full object-cover aspect-square"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-6">
                <button className="p-2 rounded-full text-white space-x-2 flex items-center font-bold">
                  <HeartIcon className="w-7 h-7" />
                  <span>{post?.likes.length}</span>
                </button>
                <button className="p-2 rounded-full text-white space-x-2 flex items-center font-bold">
                  <MessageCircleIcon className="w-7 h-7" />
                  <span>{post?.comments.length}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Save;
