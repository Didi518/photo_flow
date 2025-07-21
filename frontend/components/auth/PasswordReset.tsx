'use client';

import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';

import { BASE_API_URL } from '@/server';
import { setAuthUser } from '@/store/authSlice';

import { Button } from '../ui/button';
import LoadingButton from '../helpers/LoadingButton';
import { handleAuthRequest } from '../utils/apiRequest';

import PasswordInput from './PasswordInput';

const PasswordReset = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async () => {
    if (!password || !passwordConfirm) {
      return;
    }

    if (password !== passwordConfirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    const data = { token, password, passwordConfirm };

    const resetPassReq = async () =>
      await axios.post(`${BASE_API_URL}/users/reset-password`, data, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(resetPassReq, setIsLoading);
    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(
        result.data.message || 'Mot de passe réinitialisé avec succès!'
      );
      router.push('/auth/connexion');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Réinitialiser le mot de passe
      </h1>
      <p className="mb-6 text-sm sm:text-base text-center text-gray-600 font-medium">
        Vous pouvez modifier votre mot de passe ici.
      </p>
      <div className="mb-4 mt-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%]">
        <PasswordInput
          name="password"
          placeholder="Nouveau mot de passe"
          inputClassName="px-6 py-3 bg-gray-300 rounded-lg outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="mb-4 mt-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%]">
        <PasswordInput
          name="passwordConfirm"
          placeholder="Confirmer le nouveau mot de passe"
          inputClassName="px-6 py-3 bg-gray-300 rounded-lg outline-none"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-4 mt-6">
        <LoadingButton onClick={handleSubmit} isLoading={isLoading}>
          Changer le mot de passe
        </LoadingButton>
        <Button variant="ghost">
          <Link href="/auth/mot-de-passe-oublie">Retour</Link>
        </Button>
      </div>
    </div>
  );
};

export default PasswordReset;
