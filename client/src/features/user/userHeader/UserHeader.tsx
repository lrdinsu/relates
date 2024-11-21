import { Anchor, Avatar, Box, Flex, Stack, Tabs, Text } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';

import { UserMoreMenu } from '../userMoreMenu/userMoreMenu.tsx';
import classes from './UserHeader.module.css';

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
            <Text size="xs" p={4} className={classes.net}>
              relates.net
            </Text>
          </Flex>
        </Box>
        <Box>
          <Avatar
            alt="Kellie Smith"
            src="/kellie-avatar.webp"
            hiddenFrom="sm"
            size="lg"
          />
          <Avatar
            alt="Kellie Smith"
            src="/kellie-avatar.webp"
            visibleFrom="sm"
            size="xl"
          />
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
          <Box className={classes.iconContainer}>
            <IconCamera size={24} cursor="pointer" />
          </Box>
          <UserMoreMenu />
        </Flex>
      </Flex>

      <Tabs defaultValue="posts" w="100%">
        <Tabs.List>
          <Tabs.Tab value="posts" className={classes.tab} py={12} fw="600">
            Posts
          </Tabs.Tab>
          <Tabs.Tab
            value="replies"
            className={classes.tab}
            py={12}
            fw="600"
            c="gray.6"
          >
            Replies
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </Stack>
  );
}
