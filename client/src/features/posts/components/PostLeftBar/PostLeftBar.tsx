import { Link } from 'react-router-dom';

import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { Stack } from '@mantine/core';

import classes from './PostLeftBar.module.css';

type PostLeftBarProps = {
  username: string;
  avatar: string | null;
  withLine?: boolean;
};

export function PostLeftBar({ username, avatar, withLine }: PostLeftBarProps) {
  return (
    <Stack align="center" gap={0} className={classes.postLeftBar}>
      <Link
        to={`/user/${username}`}
        className={classes.avatarLink}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <UserPic username={username} avatar={avatar} />
      </Link>
      {withLine && <div className={classes.verticalLine} />}
    </Stack>
  );
}
