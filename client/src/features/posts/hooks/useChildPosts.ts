import { useLocation } from 'react-router-dom';

import { axiosInstance } from '@/api/axiosConfig.ts';
import { useInfiniteQuery } from '@tanstack/react-query';

import { Post } from './usePostList.ts';

type ChildPostsResponse = {
  comments: Post[];
  nextCursor: number | null;
};

export function useChildPosts(parentPostId: number) {
  const location = useLocation();

  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ['childposts', location.pathname],
      queryFn: async ({ pageParam }): Promise<ChildPostsResponse> => {
        const response = await axiosInstance.get<ChildPostsResponse>(
          `posts/${parentPostId}/comments`,
          {
            params: { cursor: pageParam == 0 ? undefined : pageParam },
          },
        );

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
    isFetching,
  } as const;
}
