import { Group } from '@mantine/core';
import {
  IconHeart,
  IconMessageCircle2,
  IconRepeat,
  IconSend,
} from '@tabler/icons-react';

import { PostAction } from './PostAction.tsx';
import styles from './PostActions.module.css';

type PostActionsProps = {
  liked: boolean;
  setLiked: React.Dispatch<React.SetStateAction<boolean>>;
};

export function PostActions({ liked, setLiked }: PostActionsProps) {
  return (
    <Group ml={-6} gap={6}>
      <PostAction color="red" onClick={() => setLiked(!liked)}>
        <IconHeart className={liked ? styles.liked : ''} />
      </PostAction>
      <PostAction color="blue" onClick={() => console.log('message')}>
        <IconMessageCircle2 />
      </PostAction>
      <PostAction color="green" onClick={() => console.log('repost')}>
        <IconRepeat />
      </PostAction>
      <PostAction color="yellow" onClick={() => console.log('share')}>
        <IconSend />
      </PostAction>
    </Group>
  );
}
