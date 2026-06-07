import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { Loading } from '@/components/Loading/Loading.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { Box, Center, Divider, Loader, Stack } from '@mantine/core';

import { CreatePost } from '../../posts/components/CreatePost/CreatePost.tsx';
import { PostItem } from '../../posts/components/PostItem/PostItem.tsx';
import { usePostwithChildPosts } from '../../posts/hooks/usePostwithChildPosts.ts';

export function PostWithComments() {
  const { ref, inView } = useInView();
  const currentPostRef = useRef<HTMLDivElement>(null);
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
  const isViewingComment = Boolean(parentPost?.parentPostId);

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!parentPost) return;

    requestAnimationFrame(() => {
      const top = currentPostRef.current?.getBoundingClientRect().top;
      if (top == null) return;

      window.scrollBy({
        top: top - 72,
        behavior: 'auto',
      });
    });
  }, [parentPost?.id]);

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
          <PostItem
            post={ancestors[ancestors.length - 1]}
            hideDivider
            replaceOnClick
            withLine
          />
        </Box>
      )}

      {/* Render Current Post */}
      {parentPost && (
        <Box ref={currentPostRef} pt="md" pb="md">
          <PostItem post={parentPost} hideDivider clickTarget={null} />
        </Box>
      )}

      {isAuthenticated && parentPost && (
        <>
          <Divider mx={-16} />
          <CreatePost parentPost={parentPost} inline />
        </>
      )}

      <Divider mx={-16} mt={0} mb="md" />

      {/* Render Child Posts */}
      <Stack gap="md">
        {childPostsData?.pages.map((page) =>
          page.comments.map((post) => (
            <PostItem post={post} key={post.id} replaceOnClick />
          )),
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

      {isViewingComment && <Box h="calc(100vh - 120px)" />}
    </Stack>
  );
}
