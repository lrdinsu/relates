import { useNavigate } from 'react-router-dom';

import { AuthResponse, axiosInstance } from '@/api/axiosConfig.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { SignupType } from '@/types/types.ts';
import { useMutation } from '@tanstack/react-query';

export const useSignupMutation = () => {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: async (data: SignupType) => {
      const response = await axiosInstance.post('/auth/signup', data);
      return response.data as AuthResponse;
    },
    onSuccess: ({ accessToken, userId, username, profilePic }) => {
      setAccessToken(accessToken, { userId, username, profilePic });
      navigate('/');
    },
  });
};
