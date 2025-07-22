import axios from 'axios';

import { BASE_API_URL } from '@/server';

export const addCommentApi = async (postId: string, text: string) => {
  return await axios.post(
    `${BASE_API_URL}/posts/comment/${postId}`,
    { text },
    { withCredentials: true }
  );
};
