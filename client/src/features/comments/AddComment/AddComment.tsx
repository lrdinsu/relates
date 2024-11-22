import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { Button, Divider, Flex, Textarea } from '@mantine/core';

import classes from './AddComment.module.css';

export function AddComment() {
  const userData = useAuthStore((state) => state.userData);

  return (
    <>
      <Divider mx={-16} />
      <Flex gap={12}>
        <UserPic
          username={userData?.username ?? ''}
          avatar={userData?.profilePic ?? ''}
        />
        <Textarea
          autosize
          placeholder="Reply..."
          className={classes.replyContent}
        />
        <Button className={classes.reply}>Reply</Button>
      </Flex>
    </>
  );
}
