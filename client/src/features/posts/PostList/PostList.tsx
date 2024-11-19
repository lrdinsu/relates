import { PostType } from 'validation';

import { axiosInstance } from '@/api/axiosConfig.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { Button, Flex, Loader, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { PostItem } from '../PostItem/PostItem.tsx';

export function PostList() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  async function fetchPosts() {
    const endpoint = isAuthenticated ? '/posts/feed' : '/posts/hot';
    const response = await axiosInstance.get<{
      message: string;
      posts: PostType[];
    }>(endpoint);

    return response.data.posts;
  }

  const {
    data: posts,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['posts', isAuthenticated],
    queryFn: fetchPosts,
  });

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error fetching posts</div>;
  }

  return (
    <Flex direction="column" gap={16}>
      <Title>{isAuthenticated ? 'Feed' : 'Hot'}</Title>
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostItem
            likes={post.likesCount}
            postText={post.text ?? 'empty'}
            postImg={post?.images?.[0]}
            replies={post.commentsCount}
            key={post.id}
          />
        ))
      ) : (
        <div>
          <Text>No posts</Text>
          <Button onClick={fetchPosts}>Try again</Button>
        </div>
      )}
    </Flex>
  );
}
