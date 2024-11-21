import { useState } from 'react';

import { Center, Group, Text } from '@mantine/core';
import {
  IconHeart,
  IconMessageCircle,
  IconRepeat,
  IconSend,
} from '@tabler/icons-react';

import { PostAction } from './PostAction.tsx';
import classes from './PostActions.module.css';

type PostActionsProps = {
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
};

export function PostActions({
  likesCount,
  commentsCount,
  repostsCount,
}: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const currentLikesCount = liked ? likesCount + 1 : likesCount;

  return (
    <Group ml={-6} gap={12}>
      <Center>
        <PostAction color="red" onClick={() => setLiked(!liked)}>
          <IconHeart className={liked ? classes.liked : ''} />
        </PostAction>
        <Text className={classes.count}>
          {currentLikesCount === 0 ? '' : currentLikesCount}
        </Text>
      </Center>
      <Center>
        <PostAction color="blue" onClick={() => console.log('message')}>
          <IconMessageCircle />
        </PostAction>
        <Text className={classes.count}>
          {commentsCount === 0 ? '' : commentsCount}
        </Text>
      </Center>
      <Center>
        <PostAction color="green" onClick={() => console.log('repost')}>
          <IconRepeat />
        </PostAction>
        <Text className={classes.count}>
          {repostsCount === 0 ? '' : repostsCount}
        </Text>
      </Center>
      <PostAction color="yellow" onClick={() => console.log('share')}>
        <IconSend />
      </PostAction>
    </Group>
  );
}
