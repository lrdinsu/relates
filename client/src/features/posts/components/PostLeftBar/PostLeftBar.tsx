import { Link } from 'react-router-dom';

import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { Stack } from '@mantine/core';
import { UserHoverCard } from '@/features/user/components/UserHoverCard/UserHoverCard.tsx';

import classes from './PostLeftBar.module.css';

type PostLeftBarProps = {
  username: string;
  avatar: string | null;
  withLine?: boolean;
};

export function PostLeftBar({ username, avatar, withLine }: PostLeftBarProps) {
  return (
    <Stack align="center" gap={0} className={classes.postLeftBar}>
      <UserHoverCard username={username}>
        <Link
          to={`/user/${username}`}
          className={classes.avatarLink}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <UserPic username={username} avatar={avatar} />
        </Link>
      </UserHoverCard>
      {withLine && <div className={classes.verticalLine} />}
    </Stack>
  );
}
