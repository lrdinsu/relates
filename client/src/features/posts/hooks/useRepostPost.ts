import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { axiosInstance } from '@/api/axiosConfig.ts';
import { Post } from './usePostList.ts';

type PostsResponse = {
  posts: Post[];
  nextCursor: number | null;
};

type ChildPostsResponse = {
  comments: Post[];
  nextCursor: number | null;
};

type PostResponse = {
  post: Post;
  ancestors?: Post[];
};

export function useRepostPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      await axiosInstance.put(`/posts/${postId}/repost`);
    },
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['childposts'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      await queryClient.cancelQueries({ queryKey: ['parentPost', postId] });

      const previousData = queryClient.getQueriesData({ queryKey: [] });

      const updatePost = (post: Post): Post => {
        if (post.id === postId) {
          return {
            ...post,
            isReposted: !post.isReposted,
            repostsCount: post.isReposted
              ? post.repostsCount - 1
              : post.repostsCount + 1,
          };
        }
        return post;
      };

      // Update every InfiniteQuery that might contain the post.
      queryClient.setQueriesData<
        InfiniteData<PostsResponse | ChildPostsResponse>
      >({ queryKey: [] }, (old) => {
        if (!old || !('pages' in old)) return old;

        return {
          ...old,
          pages: old.pages.map((page) => {
            if ('posts' in page) {
              return { ...page, posts: page.posts.map(updatePost) };
            }
            if ('comments' in page) {
              return { ...page, comments: page.comments.map(updatePost) };
            }
            return page;
          }),
        };
      });

      // Update single-post queries (getPostById / parentPost).
      queryClient.setQueriesData<PostResponse>({ queryKey: [] }, (old) => {
        if (!old || !('post' in old) || old.post.id !== postId) return old;
        return { ...old, post: updatePost(old.post) };
      });

      return { previousData };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
}
