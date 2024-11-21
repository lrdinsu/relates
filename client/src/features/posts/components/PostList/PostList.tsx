import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { Loading } from '@/components/Loading/Loading.tsx';
import { Flex, Loader } from '@mantine/core';

import { usePostsList } from '../../hooks/usePostList.ts';
import { PostItem } from '../PostItem/PostItem.tsx';

export function PostList() {
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetching } =
    usePostsList();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return <div>Error fetching posts</div>;
  }

  return (
    <Flex direction="column" gap={16}>
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <PostItem
            likes={post.likesCount}
            postText={post.text ?? 'empty'}
            postImg={post?.images?.[0]}
            replies={post.commentsCount}
            key={post.id}
          />
        )),
      )}

      {hasNextPage && (
        <div ref={ref}>{isFetching && <Loader type="dots" />}</div>
      )}
    </Flex>
  );
}
