import axios from 'axios';
import { toast } from 'sonner';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { BASE_API_URL } from '@/server';
import { setAuthUser } from '@/store/authSlice';

import { handleAuthRequest } from '../utils/apiRequest';

export const useFollowUnfollow = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowUnfollow = async (userId: string) => {
    const followUnfollowReq = async () =>
      await axios.patch(
        `${BASE_API_URL}/users/follow-unfollow/${userId}`,
        {},
        { withCredentials: true }
      );

    const result = await handleAuthRequest(followUnfollowReq, setIsLoading);
    if (result?.data.status === 'success') {
      dispatch(setAuthUser(result.data.data.user));
      toast.success(result.data.message);
    }
  };

  return { handleFollowUnfollow, isLoading };
};
