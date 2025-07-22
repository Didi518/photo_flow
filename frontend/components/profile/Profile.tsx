'use client';

import axios from 'axios';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkIcon, GridIcon, LoaderIcon, MenuIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { BASE_API_URL } from '@/server';
import type { RootState } from '@/store/store';

import { Button } from '../ui/button';
import LeftSidebar from '../home/LeftSidebar';
import { useFollowUnfollow } from '../hooks/use-auth';
import { handleAuthRequest } from '../utils/apiRequest';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

import Post from './Post';
import Save from './Save';

type Props = {
  id: string;
};

const Profile = ({ id }: Props) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [postOrSave, setPostOrSave] = useState<string>('POST');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<User>();
  const { handleFollowUnfollow, isLoading: handleFollowUnfollowLoading } =
    useFollowUnfollow();

  const isOwnProfile = user?._id === id;
  const isFollowing = user?.following?.includes(id);

  useEffect(() => {
    if (!user) {
      router.push('/auth/connexion');
      return;
    }

    const getUser = async () => {
      const getUserReq = async () =>
        await axios.get(`${BASE_API_URL}/users/profile/${id}`, {
          withCredentials: true,
        });

      const result = await handleAuthRequest(getUserReq, setIsLoading);
      if (result) {
        setUserProfile(result?.data.data.user);
      }
    };

    getUser();
  }, [id, router, user]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex mb-20">
      <div className="w-[20%] hidden md:block border-r-2 h-screen fixed">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <MenuIcon />
              <SheetContent>
                <SheetTitle></SheetTitle>
                <SheetDescription></SheetDescription>
                <LeftSidebar />
              </SheetContent>
            </SheetTrigger>
          </Sheet>
        </div>
        <div className="w-[90%] sm:w-[80%] mx-auto">
          <div className="mt-16 flex md:flex-row flex-col md:items-center pb-16 border-b-2 md:space-x-20">
            <Avatar className="h-[10rem] w-[10rem] mb-8 md:mb-0">
              <AvatarImage
                src={userProfile?.profilePicture}
                className="h-full w-full rounded-full"
              />
              <AvatarFallback className="text-7xl">
                {userProfile?.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold">{userProfile?.username}</h1>
                {isOwnProfile && (
                  <Link href="/edit-profil">
                    <Button variant="secondary">Modifier</Button>
                  </Link>
                )}
                {!isOwnProfile && (
                  <Button
                    onClick={() =>
                      !handleFollowUnfollowLoading && handleFollowUnfollow(id)
                    }
                    variant={isFollowing ? 'destructive' : 'secondary'}
                  >
                    {isFollowing ? 'Se désabonner' : 'S’abonner'}
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-8 mt-6 mb-6">
                <div>
                  <span className="font-bold">
                    {userProfile?.posts?.length ?? 0}
                  </span>
                  <span>
                    {(userProfile?.posts?.length ?? 0) <= 1
                      ? ' Post'
                      : ' Posts'}
                  </span>
                </div>
                <div>
                  <span className="font-bold">
                    {userProfile?.followers?.length ?? 0}
                  </span>
                  <span>
                    {(userProfile?.followers?.length ?? 0) <= 1
                      ? ' Abonné'
                      : ' Abonnés'}
                  </span>
                </div>
                <div>
                  <span className="font-bold">
                    {userProfile?.following?.length ?? 0}
                  </span>
                  <span>
                    {(userProfile?.following?.length ?? 0) <= 1
                      ? ' Abonnement'
                      : ' Abonnements'}
                  </span>
                </div>
              </div>
              <p className="w-[80%] font-medium">
                {userProfile?.bio || "Ma bio n'est pas encore disponible."}
              </p>
            </div>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-center space-x-14">
              <div
                className={cn(
                  'flex items-center space-x-2 cursor-pointer',
                  postOrSave === 'POST' && 'text-blue-500'
                )}
                onClick={() => setPostOrSave('POST')}
              >
                <GridIcon />
                <span className="font-semibold">Posts</span>
              </div>
              <div
                className={cn(
                  'flex items-center space-x-2 cursor-pointer',
                  postOrSave === 'SAVE' && 'text-blue-500'
                )}
                onClick={() => setPostOrSave('SAVE')}
              >
                <BookmarkIcon />
                <span className="font-semibold">Enregistrés</span>
              </div>
            </div>
            {postOrSave === 'POST' && <Post userProfile={userProfile} />}
            {postOrSave === 'SAVE' && <Save userProfile={userProfile} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
