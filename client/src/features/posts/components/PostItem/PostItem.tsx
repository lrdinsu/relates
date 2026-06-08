import { useLocation, useNavigate } from 'react-router-dom';

import { saveFeedScrollSnapshot } from '@/utils/feedScrollMemory.ts';
import { convertPostTime } from '@/utils/convertPostTime.ts';
import { Divider, Flex, Text } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';

import { Post } from '../../hooks/usePostList.ts';
import { PostActions } from '../PostActions/PostActions.tsx';
import { PostContent } from '../PostContent/PostContent.tsx';
import { PostHeader } from '../PostHeader/PostHeader.tsx';
import { PostLeftBar } from '../PostLeftBar/PostLeftBar.tsx';
import { PostMain } from '../PostMain/PostMain.tsx';
import classes from './PostItem.module.css';

type PostProps = {
  post: Post;
  withLine?: boolean;
  hideDivider?: boolean;
  clickTarget?: string | null;
  replaceOnClick?: boolean;
  feedScrollKey?: string | null;
};

export function PostItem({
  post,
  withLine,
  hideDivider,
  clickTarget,
  replaceOnClick,
  feedScrollKey,
}: PostProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const postPath = clickTarget === undefined ? `/posts/${post.id}` : clickTarget;

  const openPost = () => {
    if (!postPath || location.pathname === postPath) return;
    const postElement = document.querySelector<HTMLElement>(
      `[data-post-id="${post.id}"]`,
    );

    saveFeedScrollSnapshot(
      feedScrollKey ?? null,
      post.id,
      postElement?.getBoundingClientRect().top ?? 0,
    );

    void navigate(postPath, { replace: replaceOnClick });
  };

  return (
    <>
      <div
        onClick={openPost}
        className={classes.postItem}
        data-post-id={post.id}
        data-clickable={postPath ? true : undefined}
      >
        {post.repostedBy && (
          <Flex align="center" gap={6} c="gray.6" mb={4} ml={48}>
            <IconRepeat size={14} />
            <Text size="xs">Reposted by {post.repostedBy}</Text>
          </Flex>
        )}
        <Flex gap={12}>
          <PostLeftBar
            username={post.postedBy.username}
            avatar={post.postedBy.profilePic}
            withLine={withLine}
          />
          <PostMain>
            <PostHeader
              post={post}
              userName={post.postedBy.username}
              name={post.postedBy.name}
              postTime={convertPostTime(new Date(post.createdAt))}
              replyTo={post.parentPost?.postedBy.username}
            />
            <PostContent postText={post.text} postImages={post.images} />
            <PostActions post={post} />
          </PostMain>
        </Flex>
      </div>

      {!hideDivider && <Divider mx={-16} />}
    </>
  );
}
