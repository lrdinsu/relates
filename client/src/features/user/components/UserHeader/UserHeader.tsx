import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { Box, Flex, Stack, Tabs, Text, Button } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import { useState } from 'react';

import { UserProfile } from '../../hooks/useUserProfile.ts';
import { UserMoreMenu } from '../UserMoreMenu/userMoreMenu.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { useFollowMutation } from '../../hooks/useFollowMutation.ts';
import { useLoginModal } from '@/hooks/useLoginModal.tsx';
import classes from './UserHeader.module.css';

type UserHeaderProps = {
  tab: 'posts' | 'comments';
  onTabChange: (tab: string) => void;
  user: UserProfile;
};

export function UserHeader({ tab, onTabChange, user }: UserHeaderProps) {
  const currentUser = useAuthStore((state) => state.userData);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const followMutation = useFollowMutation();
  const openLoginModal = useLoginModal();
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const isMe = currentUser?.username === user.username;

  const handleFollow = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    followMutation.mutate(user.id);
  };

  const getButtonText = () => {
    if (isMe) return 'Edit profile';
    if (user.isFollowing) {
      return isBtnHovered ? 'Unfollow' : 'Following';
    }
    return 'Follow';
  };

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

      <Flex w="100%" justify="space-between" align="center">
        <Flex gap={8} align="center" c="gray.6">
          <Text>{user.followersCount} followers</Text>
          <Box>&bull;</Box>
          <Text>{user.followingCount} following</Text>
        </Flex>

        <Flex align="center" gap={12}>
          <Box className={classes.iconContainer}>
            <IconCamera size={24} cursor="pointer" />
          </Box>
          <UserMoreMenu />
        </Flex>
      </Flex>

      <Button
        fullWidth
        radius="md"
        variant={isMe || user.isFollowing ? 'outline' : 'filled'}
        color={!isMe && user.isFollowing && isBtnHovered ? 'red' : (isMe || user.isFollowing ? 'gray' : 'my-green')}
        onClick={isMe ? () => console.log('edit profile') : handleFollow}
        onMouseEnter={() => setIsBtnHovered(true)}
        onMouseLeave={() => setIsBtnHovered(false)}
        loading={followMutation.isPending}
        fw={700}
      >
        {getButtonText()}
      </Button>

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
