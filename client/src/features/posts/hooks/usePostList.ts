import { useLocation } from 'react-router-dom';
import { PostType } from 'validation';

import { axiosInstance } from '@/api/axiosConfig.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { useInfiniteQuery } from '@tanstack/react-query';

type PostsResponse = {
  posts: Post[];
  nextCursor: number | null;
};

export type Post = PostType & {
  postedBy: {
    id: number;
    username: string;
    profilePic: string | null;
  };
};

export function usePostsList() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  const { data, isPending, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['posts', isAuthenticated, location.pathname],
      queryFn: async ({ pageParam }): Promise<PostsResponse> => {
        let endpoint = location.pathname;

        if (endpoint === '/') {
          endpoint = isAuthenticated ? '/posts/for-you' : '/posts/hot';
        } else {
          endpoint = `/posts${endpoint}`;
        }

        const response = await axiosInstance.get<PostsResponse>(endpoint, {
          params: {
            cursor: pageParam === 0 ? undefined : pageParam,
          },
        });
        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  return {
    data,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
  } as const;
}
