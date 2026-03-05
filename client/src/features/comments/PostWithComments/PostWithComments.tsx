import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { Loading } from '@/components/Loading/Loading.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { Center, Divider, Loader, Stack } from '@mantine/core';

import { PostItem } from '../../posts/components/PostItem/PostItem.tsx';
import { usePostwithChildPosts } from '../../posts/hooks/usePostwithChildPosts.ts';
import { CreatePost } from '../../posts/components/CreatePost/CreatePost.tsx';
import { ParenPost } from '../ParentPost/ParentPost.tsx';

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
    <Stack>
      {/* Render Parent Post */}
      {parentPost && (
        <ParenPost post={parentPost} />
      )}

      {isAuthenticated && parentPost && (
        <>
          <Divider mx={-16} />
          <CreatePost parentPost={parentPost} inline />
        </>
      )}

      <Divider mx={-16} />

      {/* Render Child Posts */}
      {childPostsData?.pages.map((page) =>
        page.comments.map((post) => (
          <PostItem
            post={post}
            key={post.id}
          />
        )),
      )}

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
