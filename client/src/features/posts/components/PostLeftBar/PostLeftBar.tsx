import { Link } from 'react-router-dom';

import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { Stack } from '@mantine/core';

import classes from './PostLeftBar.module.css';

type PostLeftBarProps = {
  username: string;
  avatar: string | null;
};

export function PostLeftBar({ username, avatar }: PostLeftBarProps) {
  return (
    <Stack align="center">
      <Link
        to={`/user/${username}`}
        className={classes.avatarLink}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <UserPic username={username} avatar={avatar} />
      </Link>
    </Stack>
  );
}
