import { Link } from 'react-router-dom';

import { convertPostTime } from '@/utils/convertPostTime.ts';
import { Divider, Flex } from '@mantine/core';

import { PostActions } from '../PostActions/PostActions.tsx';
import { PostContent } from '../PostContent/PostContent.tsx';
import { PostHeader } from '../PostHeader/PostHeader.tsx';
import { PostLeftBar } from '../PostLeftBar/PostLeftBar.tsx';
import { PostMain } from '../PostMain/PostMain.tsx';
import classes from './PostItem.module.css';

type postProps = {
  postId: number;
  postImg?: string;
  postText: string;
  postTime: Date;
  postAuthor: string;
  postAuthorId: number;
  postAuthorAvatar: string | null;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
};

export function PostItem({
  postImg,
  postText,
  postTime,
  postId,
  postAuthor,
  postAuthorAvatar,
  likesCount,
  commentsCount,
  repostsCount,
}: postProps) {
  return (
    <>
      <Link to={`/posts/${postId}`} className={classes.postItem}>
        <Flex gap={12}>
          <PostLeftBar username={postAuthor} avatar={postAuthorAvatar} />
          <PostMain>
            <PostHeader
              userName={postAuthor}
              postTime={convertPostTime(new Date(postTime))}
            />
            <PostContent postText={postText} postImg={postImg} />
            <PostActions
              likesCount={likesCount}
              commentsCount={commentsCount}
              repostsCount={repostsCount}
            />
          </PostMain>
        </Flex>
      </Link>

      <Divider mx={-16} />
    </>
  );
}
