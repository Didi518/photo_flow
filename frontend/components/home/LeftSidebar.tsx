'use client';

import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  HeartIcon,
  HomeIcon,
  LogOutIcon,
  MessageCircleIcon,
  SearchIcon,
  SquarePlusIcon,
} from 'lucide-react';

import { BASE_API_URL } from '@/server';
import type { RootState } from '@/store/store';
import { setAuthUser } from '@/store/authSlice';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

import CreatePostModal from './CreatePostModal';

const LeftSidebar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogout = async () => {
    await axios.post(
      `${BASE_API_URL}/users/logout`,
      {},
      { withCredentials: true }
    );

    dispatch(setAuthUser(null));
    toast.success('Déconnexion réussie!');
    router.push('/auth/connexion');
  };

  const handleSidebar = (label: string) => {
    if (label === 'Accueil') router.push('/');
    if (label === 'Déconnexion') handleLogout();
    if (label === 'Profil') router.push(`/profil/${user?._id}`);
    if (label === 'Créer') setIsDialogOpen(true);
  };

  const SidebarLinks = [
    {
      icon: <HomeIcon />,
      label: 'Accueil',
    },
    {
      icon: <SearchIcon />,
      label: 'Recherche',
    },
    {
      icon: <MessageCircleIcon />,
      label: 'Message',
    },
    {
      icon: <HeartIcon />,
      label: 'Notification',
    },
    {
      icon: <SquarePlusIcon />,
      label: 'Créer',
    },
    {
      icon: (
        <Avatar className="w-9 h-9">
          <AvatarImage src={user?.profilePicture} className="h-full w-full" />
          <AvatarFallback className="text-xl">
            {user?.username?.charAt(0).toUpperCase() || 'Vous'}
          </AvatarFallback>
        </Avatar>
      ),
      label: 'Profil',
    },
    {
      icon: <LogOutIcon />,
      label: 'Déconnexion',
    },
  ];

  return (
    <div className="h-full">
      <CreatePostModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      <div className="lg:p-6 p-3 cursor-pointer">
        <div onClick={() => router.push('/')}>
          <Image
            src="/images/logo.png"
            alt="logo"
            width={150}
            height={150}
            className="mt-[-2rem]"
          />
        </div>
        <div className="mt-6">
          {SidebarLinks.map((link) => {
            return (
              <div
                key={link.label}
                className="flex items-center mb-2 p-3 rounded-lg group cursor-pointer transition-all duration-200 hover:bg-gray-100 space-x-2"
                onClick={() => handleSidebar(link.label)}
              >
                <div className="group-hover:scale-110 transition-all duration-200">
                  {link.icon}
                </div>
                <p className="lg:text-lg text-base">{link.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
