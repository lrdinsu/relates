import { Avatar, Box, Flex } from '@mantine/core';

import styles from './LeftBar.module.css';

export function LeftBar() {
  return (
    <Flex direction="column" align="center">
      <Avatar size="md" alt="kellie smith" src="/kellie-avatar.webp" />
      <Box w={1} bg="gray.6" my={8} className={styles.line}></Box>
      <Box w="100%" className={styles.avatars}>
        <Avatar
          size={18}
          alt="John"
          src="https://i.pravatar.cc/100?u=john"
          top={-4}
          right={2}
        />
        <Avatar
          size={15}
          alt="Sandro"
          src="https://i.pravatar.cc/100?u=sandro"
          top={0}
          left={-3}
        />
        <Avatar
          size={12}
          alt="Susan"
          src="https://i.pravatar.cc/100?u=susan"
          top={17}
          left={13}
        />
      </Box>
    </Flex>
  );
}
