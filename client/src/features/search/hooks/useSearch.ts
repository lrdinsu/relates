import { useInfiniteQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/api/axiosConfig.ts';
import { Post } from '@/features/posts/hooks/usePostList.ts';
import { UserSearchResult } from '../components/SearchUserItem.tsx';

type UserSearchResponse = {
  users: UserSearchResult[];
  nextCursor: number | null;
};

type PostSearchResponse = {
  posts: Post[];
  nextCursor: number | null;
};

export type SearchMode = 'users' | 'posts';

export function useSearch(query: string, mode: SearchMode) {
  return useInfiniteQuery({
    queryKey: ['search', mode, query],
    queryFn: async ({ pageParam }): Promise<UserSearchResponse | PostSearchResponse> => {
      const response = await axiosInstance.get(`/search/${mode}`, {
        params: {
          q: query,
          cursor: pageParam === 0 ? undefined : pageParam,
          limit: 10,
        },
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!query.trim(),
  });
}
