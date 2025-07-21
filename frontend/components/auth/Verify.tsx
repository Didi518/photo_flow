'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoaderIcon, MailCheckIcon } from 'lucide-react';

import { BASE_API_URL } from '@/server';
import type { RootState } from '@/store/store';
import { setAuthUser } from '@/store/authSlice';
import { useEmailRateLimit } from '@/hooks/useEmailRateLimit';

import LoadingButton from '../helpers/LoadingButton';
import { handleAuthRequest } from '../utils/apiRequest';

const Verify = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { isSending, countdown, startCooldown } = useEmailRateLimit({
    cooldownDuration: 30,
  });

  useEffect(() => {
    if (!user) {
      router.replace('/auth/connexion');
    } else if (user && user.isVerified) {
      router.replace('/');
    } else {
      setIsPageLoading(false);
    }
  }, [router, user]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const val = value.slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent): void => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendCode = async () => {
    startCooldown();

    const resendOtpReq = async () => {
      return await axios.post(`${BASE_API_URL}/users/resend-otp`, null, {
        withCredentials: true,
      });
    };

    const result = await handleAuthRequest(resendOtpReq, setIsVerifying);
    if (result) {
      toast.success(result.data.message);
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    const verifyReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/users/verify`,
        { otp: otpCode },
        { withCredentials: true }
      );
    };

    const result = await handleAuthRequest(verifyReq, setIsVerifying);
    if (result) {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
      router.push('/');
    }
  };

  if (isPageLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderIcon className="w-20 h-20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center flex-col justify-center">
      <MailCheckIcon className="w-20 h-20 sm:w-32 sm:h-32 text-red-600 mb-12" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Code de vérification
      </h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-medium">
        Nous vous avons envoyé un code sur: {user?.email || 'votre email'}
      </p>
      <div className="flex space-x-4">
        {[0, 1, 2, 3, 4, 5].map((index) => {
          return (
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              key={index}
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              autoFocus={index === 0}
              className="sm:w-20 sm:h-20 w-10 h-10 rounded-lg bg-gray-200 text-lg sm:text-3xl font-bold outline-gray-500 text-center no-spinner transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-rose-500"
            />
          );
        })}
      </div>
      <div className="flex items-center mt-4 space-x-2">
        <h1 className="text-sm sm:text-lg font-medium text-gray-700">
          Vous n&apos;avez pas reçu le code ?
        </h1>
        <button
          onClick={handleResendCode}
          disabled={isSending}
          className={`text-sm sm:text-lg font-medium underline ${
            isSending
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-900 hover:text-blue-700'
          }`}
        >
          {isSending ? `Renvoi dans ${countdown}s` : 'Renvoi du code'}
        </button>
      </div>
      <LoadingButton
        size="lg"
        className="mt-6 w-52"
        isLoading={isVerifying}
        onClick={handleVerify}
        disabled={otp.join('').length !== 6}
      >
        Vérifier
      </LoadingButton>
    </div>
  );
};

export default Verify;
