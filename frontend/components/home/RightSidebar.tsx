'use client';

import axios from 'axios';
import { useSelector } from 'react-redux';
import { LoaderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { User } from '@/types';
import { BASE_API_URL } from '@/server';
import type { RootState } from '@/store/store';

import { handleAuthRequest } from '../utils/apiRequest';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const RightSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const getSuggestedUsers = async () => {
      const getSuggestedUsersReq = async () =>
        await axios.get(`${BASE_API_URL}/users/suggested-users`, {
          withCredentials: true,
        });

      const result = await handleAuthRequest(
        getSuggestedUsersReq,
        setIsLoading
      );
      if (result) setSuggestedUsers(result.data.data.users);
    };

    getSuggestedUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-9 h-9">
            <AvatarImage
              src={user?.profilePicture}
              className="h-full w-full rounded-full"
            />
            <AvatarFallback>
              {user?.username?.charAt(0).toUpperCase() || 'Vous'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold">{user?.username}</h1>
            <p className="text-gray-700">
              {user?.bio || "La bio n'est pas encore remplie."}
            </p>
          </div>
        </div>
        <h1 className="font-medium text-blue-700 cursor-pointer">Changer</h1>
      </div>
      <div className="flex items-center justify-between mt-8">
        <h1 className="font-semibold text-gray-700">Comptes suggérés</h1>
        <h1 className="font-medium cursor-pointer">Voir tout</h1>
      </div>
      {suggestedUsers.slice(0, 5).map((s_user) => {
        return (
          <div
            onClick={() => router.push(`/profil/${s_user._id}`)}
            key={s_user._id}
            className="mt-6 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 cursor-pointer">
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={s_user.profilePicture}
                    className="h-full w-full rounded-full"
                  />
                  <AvatarFallback>
                    {s_user.username.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-bold">{s_user.username}</h1>
                  <p className="text-gray-700">
                    {s_user.bio || "La bio n'est pas encore remplie."}
                  </p>
                </div>
              </div>
              <h1 className="font-medium text-blue-700 cursor-pointer">
                Détails
              </h1>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RightSidebar;
