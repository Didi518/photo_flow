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
import { useEmailRateLimit } from '@/hooks/useEmailRateLimit';

import LoadingButton from '../helpers/LoadingButton';
import { handleAuthRequest } from '../utils/apiRequest';

import PasswordInput from './PasswordInput';

interface FormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const Signup = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const { isSending, countdown, canSend, startCooldown } = useEmailRateLimit({
    cooldownDuration: 30,
  });

  const handleResendVerification = async () => {
    if (!canSend) return;

    startCooldown();

    const resendOtpReq = async () => {
      return await axios.post(`${BASE_API_URL}/users/resend-otp`, null, {
        withCredentials: true,
      });
    };

    const result = await handleAuthRequest(resendOtpReq, setIsLoading);
    if (result) toast.info('Email de vérification renvoyé!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    const signupReq = async () =>
      await axios.post(`${BASE_API_URL}/users/signup`, formData, {
        withCredentials: true,
      });

    const result = await handleAuthRequest(signupReq, setIsLoading);
    if (result) {
      startCooldown();

      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
      router.push('/auth/verifier');
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
            Inscription sur <span className="text-rose-600">PhotoFlow</span>
          </h1>
          <form
            onSubmit={handleSubmit}
            className="block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[90%] xl:w-[80%]"
          >
            <div className="mb-4">
              <label htmlFor="username" className="font-semibold mb-2 block">
                Pseudonyme
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="Pseudonyme"
                className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="font-semibold mb-2 block">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
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
            </div>
            <div className="mb-4">
              <PasswordInput
                label="Confirmer le mot de passe"
                name="passwordConfirm"
                placeholder="Confirmer le mot de passe"
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
            </div>
            <LoadingButton
              size="lg"
              className="w-full mt-3"
              type="submit"
              isLoading={isLoading}
              disabled={isSending}
            >
              Inscription
            </LoadingButton>
          </form>
          {isSending && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                ✅ Email de vérification envoyé à{' '}
                <strong>{formData.email}</strong>
              </p>
              <button
                onClick={handleResendVerification}
                disabled={!canSend}
                className={`text-sm font-medium underline ${
                  !canSend
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-green-700 hover:text-green-900'
                }`}
              >
                {!canSend ? `Renvoyer dans ${countdown}s` : "Renvoyer l'email"}
              </button>
            </div>
          )}
          <h1 className="mt-4 text-lg text-gray-800">
            Déjà un compte ?{' '}
            <Link href="/auth/connexion">
              <span className="text-blue-800 underline cursor-pointer font-medium">
                Connexion
              </span>
            </Link>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Signup;
