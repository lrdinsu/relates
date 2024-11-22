import { useNavigate } from 'react-router-dom';

import { AuthResponse, axiosInstance } from '@/api/axiosConfig.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { useMutation } from '@tanstack/react-query';

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/auth/logout');
      return response.data as AuthResponse;
    },
    onSuccess: () => {
      setAccessToken(null, null);
      navigate('/', { replace: true });
    },
  });
};
