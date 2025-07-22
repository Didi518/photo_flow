'use client';

import axios from 'axios';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoaderIcon, MenuIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import { BASE_API_URL } from '@/server';
import type { RootState } from '@/store/store';
import { setAuthUser } from '@/store/authSlice';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

import Feed from './Feed';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { handleAuthRequest } from '../utils/apiRequest';

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.posts.posts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAuthUser = async () => {
      const getAuthUserReq = async () =>
        await axios.get(`${BASE_API_URL}/users/me`, {
          withCredentials: true,
        });

      const result = await handleAuthRequest(getAuthUserReq, setIsLoading);
      if (result) {
        dispatch(setAuthUser(result.data.data.user));
      }
    };

    getAuthUser();
  }, [dispatch]);

  useEffect(() => {
    if (!user) return redirect('/auth/connexion');
  }, [user]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-[20%] hidden md:block border-r-2 h-screen fixed">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription></SheetDescription>
              <LeftSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <Feed key={posts.length} />
      </div>
      <div className="w-[30%] pt-8 px-6 lg:block hidden">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
