import { axiosInstance } from '@/api/axiosConfig.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserUpdateSchema } from 'validation';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore.ts';

type UpdateProfileInput = z.infer<typeof UserUpdateSchema>;

type UpdateProfileResponse = {
  userId: number;
  username: string;
  profilePic: string | null;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const response = await axiosInstance.put<UpdateProfileResponse>('/users/me/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update auth store with new profile pic and username
      setAccessToken(accessToken, data);

      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      void queryClient.invalidateQueries({ queryKey: ['search'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
