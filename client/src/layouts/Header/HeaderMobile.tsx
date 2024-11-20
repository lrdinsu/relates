import { BackButton } from '@/components/BackButton/BackButton.tsx';
import { Logo } from '@/components/Logo/Logo.tsx';
import { Flex } from '@mantine/core';

import classes from './Header.module.css';

export function HeaderMobile() {
  return (
    <Flex justify="center" align="center" p="md" className={classes.header}>
      <BackButton />
      <Logo />
    </Flex>
  );
}
