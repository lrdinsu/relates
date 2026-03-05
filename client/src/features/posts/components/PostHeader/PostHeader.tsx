import { Link } from 'react-router-dom';

import { Flex, Text, Stack } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { UserHoverCard } from '@/features/user/components/UserHoverCard/UserHoverCard.tsx';

type PostHeaderProps = {
  postTime: string;
  userName: string;
  name: string;
  replyTo?: string;
};

export function PostHeader({
  postTime,
  userName,
  name,
  replyTo,
}: PostHeaderProps) {
  return (
    <Flex justify="space-between" w="100%">
      <Stack gap={0} w="100%">
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

      <Flex gap={16} align="center">
        <IconDots cursor="pointer" size={16} />
      </Flex>
    </Flex>
  );
}
