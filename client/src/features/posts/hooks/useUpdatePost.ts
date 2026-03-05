import { axiosInstance } from '@/api/axiosConfig.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostUpdateSchema } from 'validation';
import { z } from 'zod';

type UpdatePostInput = z.infer<typeof PostUpdateSchema>;

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: number; data: UpdatePostInput }) => {
      await axiosInstance.put(`/posts/${postId}`, data);
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
