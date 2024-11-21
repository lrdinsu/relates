import { useLocation } from 'react-router-dom';

import { axiosInstance } from '@/api/axiosConfig.ts';
import { useQuery } from '@tanstack/react-query';

import { useChildPosts } from './useChildPosts.ts';
import { Post } from './usePostList.ts';

type PostResponse = {
  post: Post;
};

export function usePostwithChildPosts() {
  const location = useLocation();
  const parentPostId = Number(location.pathname.split('/').pop());

  // Fetch the parent post
  const {
    data,
    isLoading: isParentLoading,
    isError: isParentError,
  } = useQuery<PostResponse>({
    queryKey: ['parentPost', parentPostId],
    queryFn: async () => {
      const response = await axiosInstance.get<PostResponse>(
        `posts/${parentPostId}`,
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes,
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch child posts
  const {
    data: childPostsData,
    isPending: isChildFetching,
    isError: isChildError,
    hasNextPage,
    fetchNextPage,
  } = useChildPosts(parentPostId);

  return {
    data,
    isParentLoading,
    isParentError,
    childPostsData,
    isChildFetching,
    isChildError,
    hasNextPage,
    fetchNextPage,
  };
}
