import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { useAuthStore } from '@/stores/authStore.ts';
import { Center, Divider, Loader, Stack } from '@mantine/core';

import { PostItem } from '../../posts/components/PostItem/PostItem.tsx';
import { usePostwithChildPosts } from '../../posts/hooks/usePostwithChildPosts.ts';
import { AddComment } from '../AddComment/AddComment.tsx';
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
    return <Loader />;
  }

  if (isParentError) {
    return <div>Error loading parent post</div>;
  }

  return (
    <Stack>
      {/* Render Parent Post */}
      {parentPost && (
        <ParenPost
          username={parentPost.postedBy.username}
          avatar={parentPost.postedBy.profilePic}
          likesCount={parentPost.likesCount}
          commentsCount={parentPost.commentsCount}
          repostsCount={parentPost.repostsCount}
          postText={parentPost.text}
          postImages={parentPost.images?.[0]}
          postTime={parentPost.createdAt}
        />
      )}

      {isAuthenticated && <AddComment />}

      <Divider mx={-16} />

      {/* Render Child Posts */}
      {childPostsData?.pages.map((page) =>
        page.comments.map((post) => (
          <PostItem
            postId={post.id}
            key={post.id}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            repostsCount={post.repostsCount}
            postText={post.text ?? ''}
            postImages={post?.images?.[0]}
            postTime={post.createdAt}
            postAuthor={post.postedBy.username}
            postAuthorId={post.postedBy.id}
            postAuthorAvatar={post.postedBy.profilePic}
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
