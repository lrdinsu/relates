import { Avatar } from '@mantine/core';

type UserPicProps = {
  username: string;
  avatar: string | null;
};

export function UserPic({ username, avatar }: UserPicProps) {
  return (
    <Avatar
      size="md"
      alt={username}
      src={avatar}
      key={username}
      name={username}
      color="initials"
      allowedInitialsColors={['green', 'blue', 'red', 'purple', 'yellow']}
    />
  );
}
