import { Avatar, Button, Divider, Flex, Textarea } from '@mantine/core';

import classes from './AddComment.module.css';

export function AddComment() {
  return (
    <>
      <Divider my={16} mx={-16} />
      <Flex gap={12}>
        <Avatar src="/kellie-avatar.webp" alt="kellie smith" size="md" />
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
