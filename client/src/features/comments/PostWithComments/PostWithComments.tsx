import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { Loading } from '@/components/Loading/Loading.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { Box, Center, Divider, Loader, Stack } from '@mantine/core';

import { CreatePost } from '../../posts/components/CreatePost/CreatePost.tsx';
import { PostItem } from '../../posts/components/PostItem/PostItem.tsx';
import { usePostwithChildPosts } from '../../posts/hooks/usePostwithChildPosts.ts';

export function PostWithComments() {
  const { ref, inView } = useInView();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    data,
    isParentLoading,
    isParentError,
    childPostsData,
    isChildFetching,
    isChildError,
    hasNextPage,
    fetchNextPage,
  } = usePostwithChildPosts();

  const parentPost = data?.post;
  const ancestors = data?.ancestors ?? [];

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isParentLoading) {
    return <Loading />;
  }

  if (isParentError) {
    return <div>Error loading parent post</div>;
  }

  return (
    <Stack gap={0}>
      {/* Render Ancestor (only the immediate parent) */}
      {ancestors.length > 0 && (
        <Box pb="md">
          <PostItem post={ancestors[ancestors.length - 1]} hideDivider />
          <Divider mx={-16} mt="md" />
        </Box>
      )}

      {/* Render Current Post */}
      {parentPost && (
        <Box pt="md" pb="md">
          <PostItem post={parentPost} hideDivider />
        </Box>
      )}

      {isAuthenticated && parentPost && (
        <>
          <Divider mx={-16} my="md" />
          <CreatePost parentPost={parentPost} inline />
        </>
      )}

      <Divider mx={-16} mt={0} mb="md" />

      {/* Render Child Posts */}
      <Stack gap="md">
        {childPostsData?.pages.map((page) =>
          page.comments.map((post) => <PostItem post={post} key={post.id} />),
        )}
      </Stack>

      {/* Infinite Scroll Loader */}
      {hasNextPage && (
        <div ref={ref}>
          {isChildFetching && (
            <Center>
              <Loader />
            </Center>
          )}
        </div>
      )}

      {/* Error Handling for Child Posts */}
      {isChildError && <div>Error loading child posts</div>}
    </Stack>
  );
}
