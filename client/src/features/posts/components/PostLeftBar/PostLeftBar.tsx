import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { Stack } from '@mantine/core';

type PostLeftBarProps = {
  username: string;
  avatar: string | null;
};

export function PostLeftBar({ username, avatar }: PostLeftBarProps) {
  return (
    <Stack align="center">
      <UserPic username={username} avatar={avatar} />
    </Stack>
  );
}
