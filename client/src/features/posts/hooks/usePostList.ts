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
    name: string;
    profilePic: string | null;
  };
  parentPost?: {
    postedBy: {
      username: string;
    };
  };
  isLiked: boolean;
};

export function usePostsList(endpoint = location.pathname) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  const { data, isPending, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['posts', isAuthenticated, location.pathname, endpoint],
      queryFn: async ({ pageParam }): Promise<PostsResponse> => {
        let fetchUrl = '';

        if (endpoint === '/') {
          fetchUrl = isAuthenticated ? '/posts/for-you' : '/posts/hot';
        } else {
          fetchUrl = `/posts${endpoint}`;
        }

        const response = await axiosInstance.get<PostsResponse>(fetchUrl, {
          params: {
            cursor: pageParam === 0 ? undefined : pageParam,
            limit: 10,
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
