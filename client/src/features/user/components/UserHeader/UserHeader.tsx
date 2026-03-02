import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { Box, Flex, Stack, Tabs, Text } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';

import { UserProfile } from '../../hooks/useUserProfile.ts';
import { UserMoreMenu } from '../UserMoreMenu/userMoreMenu.tsx';
import classes from './UserHeader.module.css';

type UserHeaderProps = {
  tab: 'posts' | 'comments';
  onTabChange: (tab: string) => void;
  user: UserProfile;
};

export function UserHeader({ tab, onTabChange, user }: UserHeaderProps) {
  return (
    <Stack gap={16} align="start" className={classes.container}>
      <Flex justify="space-between" w="100%">
        <Box>
          <Text size="xl" fw="bold">
            {user.name}
          </Text>
          <Flex gap={8} align="center">
            <Text size="sm">@{user.username}</Text>
            <Text size="xs" p={4} className={classes.net}>
              relates.net
            </Text>
          </Flex>
        </Box>
        <Box>
          <UserPic
            username={user.username}
            avatar={user.profilePic}
            hiddenFrom="sm"
            size="lg"
          />
          <UserPic
            username={user.username}
            avatar={user.profilePic}
            visibleFrom="sm"
            size="xl"
          />
        </Box>
      </Flex>

      <Text> {user.biography ?? 'Introduce yourself to the world...'} </Text>

      <Flex w="100%" justify="space-between">
        <Flex gap={8} align="center" c="gray.6">
          <Text>{user.followersCount} followers</Text>
          <Box>&bull;</Box>
          <Text>{user.followingCount} following</Text>
        </Flex>

        <Flex>
          <Box className={classes.iconContainer}>
            <IconCamera size={24} cursor="pointer" />
          </Box>
          <UserMoreMenu />
        </Flex>
      </Flex>

      <Tabs value={tab} onChange={(v) => onTabChange(v!)} w="100%">
        <Tabs.List>
          <Tabs.Tab value="posts" className={classes.tab} py={12} fw="600">
            Posts
          </Tabs.Tab>
          <Tabs.Tab
            value="comments"
            className={classes.tab}
            py={12}
            fw="600"
            c="gray.6"
          >
            Comments
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </Stack>
  );
}
