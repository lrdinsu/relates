import { Avatar } from '@mantine/core';

type UserPicProps = {
  username: string;
  avatar: string | null;
  hiddenFrom?: string;
  visibleFrom?: string;
  size?: string;
};

export function UserPic({
  username,
  avatar,
  hiddenFrom,
  visibleFrom,
  size,
}: UserPicProps) {
  return (
    <Avatar
      alt={username}
      src={avatar}
      key={username}
      name={username}
      color="initials"
      allowedInitialsColors={['green', 'blue', 'red', 'purple', 'yellow']}
      hiddenFrom={hiddenFrom}
      visibleFrom={visibleFrom}
      size={size}
    />
  );
}
