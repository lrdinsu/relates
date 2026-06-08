import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useLocation, useNavigationType } from 'react-router-dom';

import { Loading } from '@/components/Loading/Loading.tsx';
import {
  getFeedScrollKey,
  restoreFeedScrollSnapshot,
} from '@/utils/feedScrollMemory.ts';
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
  const location = useLocation();
  const navigationType = useNavigationType();
  const feedScrollKey = getFeedScrollKey(
    location.pathname,
    endpoint ?? location.pathname,
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (isPending) return;

    const frame = requestAnimationFrame(() => {
      if (navigationType === 'POP') {
        restoreFeedScrollSnapshot(feedScrollKey);
        return;
      }

      if (feedScrollKey) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [feedScrollKey, isPending, navigationType]);

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
            feedScrollKey={feedScrollKey}
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
