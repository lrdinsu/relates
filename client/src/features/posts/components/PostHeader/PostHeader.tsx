import { Link } from 'react-router-dom';

import { Flex, Text, Stack } from '@mantine/core';
import { UserHoverCard } from '@/features/user/components/UserHoverCard/UserHoverCard.tsx';
import { PostMoreMenu } from '../PostMoreMenu/PostMoreMenu.tsx';
import { Post } from '../../hooks/usePostList.ts';

type PostHeaderProps = {
  post: Post;
  postTime: string;
  userName: string;
  name: string;
  replyTo?: string;
};

export function PostHeader({
  post,
  postTime,
  userName,
  name,
  replyTo,
}: PostHeaderProps) {
  return (
    <Flex justify="space-between" w="100%">
      <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
        <Flex w="100%" align="center" gap={4}>
          <UserHoverCard username={userName}>
            <Flex align="center" gap={4}>
              <Link
                to={`/user/${userName}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Text size="sm" fw="bold" truncate>
                  {name}
                </Text>
              </Link>
              <Text size="xs" c="gray.6" truncate>
                @{userName}
              </Text>
            </Flex>
          </UserHoverCard>
          <Text size="xs" c="gray.6">
            ·
          </Text>
          <Text size="xs" c="gray.6">
            {postTime}
          </Text>
        </Flex>
        {replyTo && (
          <Text size="xs" c="gray.6">
            Replying to{' '}
            <UserHoverCard username={replyTo}>
              <Link
                to={`/user/${replyTo}`}
                style={{ textDecoration: 'none', color: '#4dabf7' }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                @{replyTo}
              </Link>
            </UserHoverCard>
          </Text>
        )}
      </Stack>

      <Flex gap={16} align="flex-start" mt={-4} mr={-8}>
        <PostMoreMenu post={post} />
      </Flex>
    </Flex>
  );
}
