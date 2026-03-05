import { axiosInstance } from '@/api/axiosConfig.ts';
import { queryClient } from '@/api/queryClient.ts';
import { useMutation } from '@tanstack/react-query';

import { Post } from './usePostList.ts';

type CreatePostInput = {
  text?: string;
  images?: string[];
  parentPostId?: number;
};

type CreatePostResponse = {
  post: Post;
};

export function useCreatePost() {
  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const { parentPostId, ...data } = input;
      const url = parentPostId ? `/posts/${parentPostId}` : '/posts';
      const response = await axiosInstance.post<CreatePostResponse>(url, data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      void queryClient.invalidateQueries({ queryKey: ['parentPost'] });
      void queryClient.invalidateQueries({ queryKey: ['childposts'] });
    },
  });
}
