import { useState, useEffect } from 'react';

interface UseEmailRateLimitProps {
  cooldownDuration?: number;
}

interface UseEmailRateLimitReturn {
  isSending: boolean;
  countdown: number;
  canSend: boolean;
  startCooldown: () => void;
  resetCooldown: () => void;
}

export const useEmailRateLimit = ({
  cooldownDuration = 30,
}: UseEmailRateLimitProps = {}): UseEmailRateLimitReturn => {
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isSending) {
      setIsSending(false);
    }

    return () => clearTimeout(timer);
  }, [countdown, isSending]);

  const startCooldown = () => {
    setIsSending(true);
    setCountdown(cooldownDuration);
  };

  const resetCooldown = () => {
    setIsSending(false);
    setCountdown(0);
  };

  return {
    isSending,
    countdown,
    canSend: !isSending,
    startCooldown,
    resetCooldown,
  };
};
