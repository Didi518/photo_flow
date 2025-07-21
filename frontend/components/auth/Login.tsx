'use client';

import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import { BASE_API_URL } from '@/server';
import { setAuthUser } from '@/store/authSlice';

import LoadingButton from '../helpers/LoadingButton';
import { handleAuthRequest } from '../utils/apiRequest';

import PasswordInput from './PasswordInput';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginReq = async () =>
      await axios.post(`${BASE_API_URL}/users/login`, formData, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(loginReq, setIsLoading);
    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
      router.push('/');
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-4 h-screen hidden lg:block">
          <Image
            src="/images/signup_banner.jpg"
            alt="inscription"
            width={1000}
            height={1000}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-3 flex flex-col items-center justify-center h-screen">
          <h1 className="font-bold text-xl sm:text-2xl text-left uppercase mb-8">
            Connexion sur <span className="text-rose-600">PhotoFlow</span>
          </h1>
          <form
            onSubmit={handleSubmit}
            className="block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[90%] xl:w-[80%]"
          >
            <div className="mb-4">
              <label htmlFor="email" className="font-semibold mb-2 block">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <PasswordInput
                label="Mot de passe"
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
              <Link
                href="/auth/mot-de-passe-oublie"
                className="mt-2 text-red-600 block font-semibold text-base cursor-pointer text-right"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <LoadingButton
              size="lg"
              className="w-full mt-3"
              type="submit"
              isLoading={isLoading}
            >
              Connexion
            </LoadingButton>
          </form>
          <h1 className="mt-4 text-lg text-gray-800">
            Toujours pas de compte ?{' '}
            <Link href="/auth/inscription">
              <span className="text-blue-800 underline cursor-pointer font-medium">
                Inscription
              </span>
            </Link>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Login;
