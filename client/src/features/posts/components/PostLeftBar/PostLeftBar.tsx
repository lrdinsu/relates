import { Avatar, Stack } from '@mantine/core';

type PostLeftBarProps = {
  username: string;
  avatar: string | null;
};

export function PostLeftBar({ username, avatar }: PostLeftBarProps) {
  return (
    <Stack align="center">
      <Avatar
        size="md"
        alt={username}
        src={avatar}
        key={username}
        name={username}
        color="initials"
        allowedInitialsColors={['green', 'blue', 'red', 'purple', 'yellow']}
      />
    </Stack>
  );
}
