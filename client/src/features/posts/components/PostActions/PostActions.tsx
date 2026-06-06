import { useNavigate } from 'react-router-dom';

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
import { showNotificationSuccess } from '@/utils/showNotifications.tsx';
import { useLikePost } from '../../hooks/useLikePost.ts';
import { useRepostPost } from '../../hooks/useRepostPost.ts';

type PostActionsProps = {
  post: Post;
};

export function PostActions({ post }: PostActionsProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useLoginModal();
  const openCreatePostModal = useCreatePostModal();
  const { mutate: likePost } = useLikePost();
  const { mutate: repostPost } = useRepostPost();
  const navigate = useNavigate();

  const { likesCount, commentsCount, repostsCount, isLiked, isReposted, id } =
    post;

  async function handleShare() {
    const url = `${window.location.origin}/posts/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      showNotificationSuccess({
        title: 'Link copied',
        message: 'Post link copied to your clipboard.',
      });
    } catch {
      // Clipboard can be unavailable (e.g. non-HTTPS); show the link to copy.
      showNotificationSuccess({ title: 'Share', message: url });
    }
  }

  return (
    <Group ml={-6} gap={12}>
      <Center>
        <PostAction
          color="red"
          onClick={() => {
            if (!isAuthenticated) return openLoginModal();
            likePost(id);
          }}
        >
          <IconHeart className={isLiked ? classes.liked : ''} />
        </PostAction>
        <Text className={classes.count}>
          {likesCount === 0 ? '' : likesCount}
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
            const willRepost = !isReposted;
            repostPost(id);
            // On a repost (not an undo), open the post so the user sees it as
            // "their" reposted post; unreposting stays put.
            if (willRepost) void navigate(`/posts/${id}`);
          }}
        >
          <IconRepeat className={isReposted ? classes.reposted : ''} />
        </PostAction>
        <Text className={classes.count}>
          {repostsCount === 0 ? '' : repostsCount}
        </Text>
      </Center>
      <PostAction
        color="yellow"
        onClick={() => {
          void handleShare();
        }}
      >
        <IconSend />
      </PostAction>
    </Group>
  );
}
