import { Button, Divider, Flex, Textarea } from '@mantine/core';

import classes from './AddComment.module.css';

export function AddComment() {
  return (
    <>
      <Divider mx={-16} />
      <Flex gap={12}>
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
