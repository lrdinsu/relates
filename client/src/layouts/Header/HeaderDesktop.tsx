import { BackButton } from '@/components/BackButton/BackButton.tsx';
import { Flex, UnstyledButton } from '@mantine/core';

import classes from './Header.module.css';

export function HeaderDesktop() {
  return (
    <Flex justify="center" align="center" p="md" className={classes.header}>
      <BackButton />
      <UnstyledButton>Home</UnstyledButton>
    </Flex>
  );
}
