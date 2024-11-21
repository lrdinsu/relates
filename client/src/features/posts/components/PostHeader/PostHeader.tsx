import { Flex, Text } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';

type PostHeaderProps = {
  postTime: string;
  userName: string;
};

export function PostHeader({ postTime, userName }: PostHeaderProps) {
  return (
    <Flex justify="space-between" w="100%">
      <Flex w="100%" align="center" gap={10}>
        <Text size="sm" fw="bold">
          {userName}
        </Text>
        <Text size="sm" c="gray.6">
          {postTime}
        </Text>
      </Flex>

      <Flex gap={16} align="center">
        <IconDots cursor="pointer" />
      </Flex>
    </Flex>
  );
}
