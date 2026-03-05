import { axiosInstance } from '@/api/axiosConfig.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      await axiosInstance.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      void queryClient.invalidateQueries({ queryKey: ['post'] });
      void queryClient.invalidateQueries({ queryKey: ['childposts'] });
      void queryClient.invalidateQueries({ queryKey: ['parentPost'] });
      void queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });
}
