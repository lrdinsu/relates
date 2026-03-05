import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { Loading } from '@/components/Loading/Loading.tsx';
import { Center, Loader, Stack } from '@mantine/core';

import { usePostsList } from '../../hooks/usePostList.ts';
import { PostItem } from '../PostItem/PostItem.tsx';

type PostListProps = {
  endpoint?: string;
};

export function PostList({ endpoint }: PostListProps) {
  const { data, isPending, isError, hasNextPage, fetchNextPage } =
    usePostsList(endpoint);
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
    return <div>Error loading posts</div>;
  }

  return (
    <Stack>
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <PostItem
            post={post}
            key={post.id}
          />
        )),
      )}

      {hasNextPage && (
        <div ref={ref}>
          <Center>
            <Loader type="dots" />
          </Center>
        </div>
      )}
    </Stack>
  );
}
