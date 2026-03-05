import { axiosInstance } from '@/api/axiosConfig.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await axiosInstance.put<{ message?: string }>(
        `/users/follow/${userId}`,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      void queryClient.invalidateQueries({ queryKey: ['parentPost'] });
      void queryClient.invalidateQueries({ queryKey: ['childposts'] });
      void queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });
}
