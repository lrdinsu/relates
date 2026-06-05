import { useNavigate } from 'react-router-dom';

import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { convertPostTime } from '@/utils/convertPostTime.ts';
import { Flex, Text } from '@mantine/core';

import { NotificationItem as NotificationData } from '../hooks/useNotifications.ts';

export function NotificationItem({
  notification,
}: {
  notification: NotificationData;
}) {
  const navigate = useNavigate();
  const { type, actor, post, createdAt } = notification;

  // A like points at the post; a follow points at the follower's profile.
  const destination =
    type === 'LIKE' && post ? `/posts/${post.id}` : `/user/${actor.username}`;

  return (
    <Flex
      gap={12}
      align="center"
      onClick={() => navigate(destination)}
      style={{ cursor: 'pointer', padding: '12px 4px' }}
    >
      <UserPic username={actor.username} avatar={actor.profilePic} />
      <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm">
          <Text span fw={700}>
            @{actor.username}
          </Text>{' '}
          {type === 'LIKE' ? 'liked your post' : 'followed you'}
        </Text>
        {type === 'LIKE' && post?.text && (
          <Text size="xs" c="gray.6" truncate>
            {post.text}
          </Text>
        )}
      </Flex>
      <Text size="xs" c="gray.6">
        {convertPostTime(new Date(createdAt))}
      </Text>
    </Flex>
  );
}
