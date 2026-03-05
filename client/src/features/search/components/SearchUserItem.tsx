import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Flex, Stack, Text } from '@mantine/core';
import { useAuthStore } from '@/stores/authStore.ts';
import { useFollowMutation } from '@/features/user/hooks/useFollowMutation.ts';
import { useLoginModal } from '@/hooks/useLoginModal.tsx';
import { useState } from 'react';

export type UserSearchResult = {
  id: number;
  username: string;
  name: string;
  profilePic: string | null;
  biography: string | null;
  followersCount: number;
  isFollowing: boolean;
};

type SearchUserItemProps = {
  user: UserSearchResult;
};

export function SearchUserItem({ user }: SearchUserItemProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.userData);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const followMutation = useFollowMutation();
  const openLoginModal = useLoginModal();
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const isMe = currentUser?.username === user.username;

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    followMutation.mutate(user.id);
  };

  const getButtonText = () => {
    if (user.isFollowing) {
      return isBtnHovered ? 'Unfollow' : 'Following';
    }
    return 'Follow';
  };

  return (
    <Box 
      p="md" 
      onClick={() => navigate(`/user/${user.username}`)}
      style={{ cursor: 'pointer' }}
    >
      <Flex gap="md" align="flex-start">
        <Avatar
          src={user.profilePic}
          name={user.name}
          size="md"
          radius="xl"
        />
        <Stack gap={4} style={{ flex: 1 }}>
          <Flex justify="space-between" align="center">
            <Box>
              <Text fw={700} size="sm">
                {user.username}
              </Text>
              <Text c="dimmed" size="xs">
                {user.name}
              </Text>
            </Box>
            {!isMe && (
              <Button
                radius="xl"
                size="xs"
                variant={user.isFollowing ? 'outline' : 'filled'}
                color={user.isFollowing ? (isBtnHovered ? 'red' : 'gray') : 'my-green'}
                onClick={handleFollow}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
                loading={followMutation.isPending}
                styles={{
                    root: {
                        fontWeight: 700,
                        minWidth: '90px',
                    }
                }}
              >
                {getButtonText()}
              </Button>
            )}
          </Flex>
          {user.biography && (
            <Text size="sm" lineClamp={2}>
              {user.biography}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            {user.followersCount} followers
          </Text>
        </Stack>
      </Flex>
    </Box>
  );
}
