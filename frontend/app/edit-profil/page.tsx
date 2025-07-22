'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { MenuIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { BASE_API_URL } from '@/server';
import type { RootState } from '@/store/store';
import { setAuthUser } from '@/store/authSlice';
import LeftSidebar from '@/components/home/LeftSidebar';
import PasswordInput from '@/components/auth/PasswordInput';
import LoadingButton from '@/components/helpers/LoadingButton';
import { handleAuthRequest } from '@/components/utils/apiRequest';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const EditProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    user?.profilePicture || null
  );
  const [initialImage, setInitialImage] = useState(user?.profilePicture || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [initialBio, setInitialBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('bio', bio);
    if (fileInputRef.current?.files?.[0]) {
      formData.append('profilePicture', fileInputRef.current.files[0]);
      setInitialImage(URL.createObjectURL(fileInputRef.current.files[0]));
    }

    const updateProfileReq = async () =>
      await axios.patch(`${BASE_API_URL}/users/edit-profile`, formData, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(updateProfileReq, setIsLoading);
    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message || 'Profil mis à jour avec succès!');
      setInitialBio(bio);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    const data = { currentPassword, newPassword, newPasswordConfirm };

    const updatePasswordReq = async () =>
      await axios.patch(`${BASE_API_URL}/users/change-password`, data, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(updatePasswordReq, setIsLoading);
    if (result) {
      toast.success(result.data.message || 'Mot de passe changé avec succès!');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    }
  };

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
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
              <LeftSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="w-[80%] mx-auto">
          <div className="mt-16 pb-16 border-b-2">
            <div
              onClick={handleAvatarClick}
              className="flex items-center justify-center cursor-pointer"
            >
              <Avatar className="h-[10rem] w-[10rem]">
                <AvatarImage src={selectedImage || ''} />
                <AvatarFallback className="text-7xl">
                  {user?.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center w-full">
                <LoadingButton
                  isLoading={isLoading}
                  size="lg"
                  className="bg-blue-800 mt-4"
                  onClick={handleUpdateProfile}
                  disabled={
                    !fileInputRef.current?.files?.[0] ||
                    selectedImage === initialImage
                  }
                >
                  Changer de Photo
                </LoadingButton>
                {!fileInputRef.current?.files?.[0] && (
                  <p className="text-sm text-gray-500 mt-2">
                    Sélectionnez une nouvelle image pour activer le bouton.
                  </p>
                )}
                {fileInputRef.current?.files?.[0] &&
                  selectedImage === initialImage && (
                    <p className="text-sm text-gray-500 mt-2">
                      L’image sélectionnée est identique à l’actuelle.
                    </p>
                  )}
              </div>
            </div>
          </div>
          <div className="mt-10 border-b-2 pb-10">
            <label htmlFor="bio" className="block text-lg font-bold mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-[7rem] bg-gray-200 outline-none p-6 rounded-md"
            />
            <div className="flex flex-col items-center w-full">
              <LoadingButton
                isLoading={isLoading}
                size="lg"
                className="mt-6"
                onClick={handleUpdateProfile}
                disabled={!bio || bio === initialBio}
              >
                Changer la Bio
              </LoadingButton>
              {!bio && (
                <p className="text-sm text-gray-500 mt-2">
                  Saisissez une bio pour activer le bouton.
                </p>
              )}
              {bio === initialBio && bio && (
                <p className="text-sm text-gray-500 mt-2">
                  La bio n&apos;a pas été modifiée.
                </p>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mt-6">
              Changer de Mot de Passe
            </h1>
            <form className="mt-8 mb-8" onSubmit={handlePasswordChange}>
              <div className="w-[90%] md:w-[80%] lg:w-[60%]">
                <PasswordInput
                  name="currentPassword"
                  value={currentPassword}
                  label="Mot de Passe Actuel"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="w-[90%] md:w-[80%] lg:w-[60%] mt-4 mb-4">
                <PasswordInput
                  name="newPassword"
                  value={newPassword}
                  label="Nouveau Mot de Passe"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="w-[90%] md:w-[80%] lg:w-[60%]">
                <PasswordInput
                  name="newPasswordConfirm"
                  value={newPasswordConfirm}
                  label="Confirmer le Nouveau Mot de Passe"
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
              </div>
              <div className="flex flex-col items-center w-full mt-6">
                <LoadingButton
                  isLoading={isLoading}
                  type="submit"
                  className="bg-red-700"
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !newPasswordConfirm ||
                    currentPassword === newPassword ||
                    newPassword !== newPasswordConfirm
                  }
                >
                  Mettre à Jour
                </LoadingButton>
                {!currentPassword && (
                  <p className="text-sm text-red-700 mt-2">
                    Saisissez votre mot de passe actuel pour continuer.
                  </p>
                )}
                {newPassword && currentPassword === newPassword && (
                  <p className="text-sm text-red-700 mt-2">
                    Le nouveau mot de passe doit être différent de
                    l&apos;actuel.
                  </p>
                )}
                {newPassword &&
                  newPasswordConfirm &&
                  newPassword !== newPasswordConfirm && (
                    <p className="text-sm text-red-700 mt-2">
                      Les mots de passe ne correspondent pas.
                    </p>
                  )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
