'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { useState } from 'react';
import { KeySquareIcon } from 'lucide-react';

import { useEmailRateLimit } from '@/hooks/useEmailRateLimit';

import { BASE_API_URL } from '@/server';
import LoadingButton from '../helpers/LoadingButton';
import { handleAuthRequest } from '../utils/apiRequest';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { isSending, countdown, canSend, startCooldown } = useEmailRateLimit({
    cooldownDuration: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    startCooldown();
    const resetReq = async () => {
      return await axios.post(
        `${BASE_API_URL}/users/forget-password`,
        { email },
        { withCredentials: true }
      );
    };
    const result = await handleAuthRequest(resetReq, setIsLoading);
    if (result) {
      toast.success(result.data.message || 'Lien de réinitialisation envoyé!');
    }
  };

  return (
    <div className="h-screen flex items-center flex-col justify-center w-full">
      <KeySquareIcon className="w-20 h-20 sm:w-32 sm:h-32 text-red-600 mb-12" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Mot de passe oublié ?
      </h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-medium text-center">
        Saisissez votre adresse email et nous vous guiderons pour réinitialiser
        votre mot de passe.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse email"
        required
        className="px-6 py-3.5 bg-gray-200 rounded-lg outline-none block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] mx-auto"
      />
      <LoadingButton
        type="submit"
        isLoading={isLoading}
        disabled={!canSend || !email.trim()}
        className="w-40 mt-4"
        size="lg"
        onClick={handleSubmit}
      >
        {isSending ? `Renvoyer dans ${countdown}s` : 'Continuer'}
      </LoadingButton>
      {isSending && (
        <p className="mt-4 text-sm text-gray-600">
          Un nouveau lien pourra être envoyé dans {countdown} secondes.
        </p>
      )}
    </div>
  );
};

export default ForgotPassword;
