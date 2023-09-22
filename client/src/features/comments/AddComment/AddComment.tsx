import { Avatar, Button, Divider, Flex, Textarea } from '@mantine/core';

import styles from './AddComment.module.css';

export function AddComment() {
  return (
    <>
      <Divider my={16} />
      <Flex gap={12}>
        <Avatar src="/kellie-avatar.webp" alt="kellie smith" size="md" />
        <Textarea
          autosize
          placeholder="Reply..."
          className={styles.replyContent}
        />
        <Button className={styles.reply}>Reply</Button>
      </Flex>
      <Divider my={16} />
    </>
  );
}
