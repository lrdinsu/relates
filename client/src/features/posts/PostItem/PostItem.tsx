import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Flex } from '@mantine/core';

import { PostActions } from '../PostActions/PostActions.tsx';
import { PostContent } from '../PostContent/PostContent.tsx';
import { PostHeader } from '../PostHeader/PostHeader.tsx';
import { PostLeftBar } from '../PostLeftBar/PostLeftBar.tsx';
import { PostMain } from '../PostMain/PostMain.tsx';
import { PostStats } from '../PostStats/PostStats.tsx';
import styles from './PostItem.module.css';

type postProps = {
  likes: number;
  replies: number;
  postImg?: string;
  postText: string;
};

export function PostItem({ likes, replies, postImg, postText }: postProps) {
  const [liked, setLiked] = useState(false);

  return (
    <Link to="/kellie/post/1" className={styles.postItem}>
      <Flex gap={12} mb={16} py={20}>
        <PostLeftBar />
        <PostMain>
          <PostHeader userName={'kelliesmith'} createdAt={'1d'} />
          <PostContent postText={postText} postImg={postImg} />
          <PostActions liked={liked} setLiked={setLiked} />
          <PostStats replies={replies} likes={likes} />
        </PostMain>
      </Flex>
    </Link>
  );
}
