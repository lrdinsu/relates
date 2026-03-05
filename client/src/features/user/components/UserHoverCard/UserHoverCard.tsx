import { HoverCard, Group, Avatar, Text, Stack, Button, Flex } from '@mantine/core';
import { useUserProfile } from '../../hooks/useUserProfile.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { useFollowMutation } from '../../hooks/useFollowMutation.ts';
import { useLoginModal } from '@/hooks/useLoginModal.tsx';
import { useState } from 'react';

type UserHoverCardProps = {
  username: string;
  children: React.ReactNode;
};

export function UserHoverCard({ username, children }: UserHoverCardProps) {
  const { data: user, isLoading } = useUserProfile(username);
  const currentUser = useAuthStore((state) => state.userData);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const followMutation = useFollowMutation();
  const openLoginModal = useLoginModal();
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const isMe = currentUser?.username === username;

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (user) {
      followMutation.mutate(user.id);
    }
  };

  const getButtonText = () => {
    if (!user) return '';
    if (user.isFollowing) {
      return isBtnHovered ? 'Unfollow' : 'Following';
    }
    return 'Follow';
  };

  return (
    <HoverCard width={300} shadow="md" withArrow openDelay={500}>
      <HoverCard.Target>
        <span style={{ display: 'inline-block' }}>{children}</span>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        {isLoading ? (
          <Text size="sm">Loading...</Text>
        ) : user ? (
          <Stack gap="md">
            <Flex justify="space-between" align="flex-start">
              <Avatar
                src={user.profilePic}
                name={user.name}
                size="lg"
                radius="xl"
              />
              {!isMe && (
                <Button
                  radius="xl"
                  size="sm"
                  variant={user.isFollowing ? 'outline' : 'filled'}
                  color={user.isFollowing ? (isBtnHovered ? 'red' : 'gray') : 'my-green'}
                  onClick={handleFollow}
                  onMouseEnter={() => setIsBtnHovered(true)}
                  onMouseLeave={() => setIsBtnHovered(false)}
                  loading={followMutation.isPending}
                  styles={{
                    root: {
                      fontWeight: 700,
                      minWidth: '100px',
                    }
                  }}
                >
                  {getButtonText()}
                </Button>
              )}
            </Flex>

            <Stack gap={0}>
              <Text fw={700} size="md">
                {user.name}
              </Text>
              <Text c="dimmed" size="sm">
                @{user.username}
              </Text>
            </Stack>

            {user.biography && (
              <Text size="sm">
                {user.biography}
              </Text>
            )}

            <Group gap="md">
              <Group gap={4}>
                <Text fw={700} size="sm">
                  {user.followingCount}
                </Text>
                <Text c="dimmed" size="sm">
                  Following
                </Text>
              </Group>
              <Group gap={4}>
                <Text fw={700} size="sm">
                  {user.followersCount}
                </Text>
                <Text c="dimmed" size="sm">
                  Followers
                </Text>
              </Group>
            </Group>
          </Stack>
        ) : (
          <Text size="sm">User not found</Text>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
