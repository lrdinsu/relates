import { Anchor, Avatar, Box, Flex, Stack, Text } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';

import { UseMoreMenu } from '../userMoreMenu/useMoreMenu.tsx';
import styles from './UserHeader.module.css';

export function UserHeader() {
  return (
    <Stack gap={16} align="start">
      <Flex justify="space-between" w="100%">
        <Box>
          <Text size="xl" fw="bold">
            Kellie Smith
          </Text>
          <Flex gap={8} align="center">
            <Text size="sm">kelliesmith</Text>
            <Text size="xs" p={4} className={styles.net}>
              relates.net
            </Text>
          </Flex>
        </Box>
        <Box>
          <Avatar alt="Kellie Smith" src="/kellie-avatar.webp" size="xl" />
        </Box>
      </Flex>

      <Text>Exploring happiness, habits, and human nature.</Text>

      <Flex w="100%" justify="space-between">
        <Flex gap={8} align="center" c="gray.6">
          <Text>3.2k followers</Text>
          <Box>&bull;</Box>
          <Anchor c="inherit">kelliesmith.com</Anchor>
        </Flex>

        <Flex>
          <Box className={styles.iconContainer}>
            <IconCamera size={24} cursor="pointer" />
          </Box>
          <UseMoreMenu />
        </Flex>
      </Flex>

      <Flex w="100%">
        <Flex justify="center" pb={12} className={styles.posts}>
          <Text fw="bold">Posts</Text>
        </Flex>
        <Flex justify="center" pb={12} className={styles.replies}>
          <Text fw="bold" c="gray.6">
            Replies
          </Text>
        </Flex>
      </Flex>
    </Stack>
  );
}
