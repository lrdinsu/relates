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
import { Post } from '../../hooks/usePostList.ts';
import { useCreatePostModal } from '@/hooks/useCreatePostModal.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { useLoginModal } from '@/hooks/useLoginModal.tsx';

type PostActionsProps = {
  post: Post;
};

export function PostActions({ post }: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useLoginModal();
  const openCreatePostModal = useCreatePostModal();

  const { likesCount, commentsCount, repostsCount } = post;
  const currentLikesCount = liked ? likesCount + 1 : likesCount;

  return (
    <Group ml={-6} gap={12}>
      <Center>
        <PostAction
          color="red"
          onClick={() => {
            if (!isAuthenticated) return openLoginModal();
            setLiked(!liked);
          }}
        >
          <IconHeart className={liked ? classes.liked : ''} />
        </PostAction>
        <Text className={classes.count}>
          {currentLikesCount === 0 ? '' : currentLikesCount}
        </Text>
      </Center>
      <Center>
        <PostAction
          color="blue"
          onClick={() => {
            if (!isAuthenticated) return openLoginModal();
            openCreatePostModal(post);
          }}
        >
          <IconMessageCircle />
        </PostAction>
        <Text className={classes.count}>
          {commentsCount === 0 ? '' : commentsCount}
        </Text>
      </Center>
      <Center>
        <PostAction
          color="green"
          onClick={() => {
            if (!isAuthenticated) return openLoginModal();
            console.log('repost');
          }}
        >
          <IconRepeat />
        </PostAction>
        <Text className={classes.count}>
          {repostsCount === 0 ? '' : repostsCount}
        </Text>
      </Center>
      <PostAction
        color="yellow"
        onClick={() => {
          if (!isAuthenticated) return openLoginModal();
          console.log('share');
        }}
      >
        <IconSend />
      </PostAction>
    </Group>
  );
}
