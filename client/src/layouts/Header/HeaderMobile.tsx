import { BackButton } from '@/components/BackButton/BackButton.tsx';
import { DropdownMenu } from '@/components/DropdownMenu/DropdownMenu.tsx';
import { Logo } from '@/components/Logo/Logo.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { Burger, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import classes from './Header.module.css';

export function HeaderMobile() {
  const [opened, { toggle }] = useDisclosure();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Flex justify="center" align="center" p="md" className={classes.header}>
      <BackButton />
      <Logo />

      {isAuthenticated && (
        <DropdownMenu
          target={
            <Burger
              opened={opened}
              onClick={toggle}
              aria-label="Toggle navigation"
              className={classes.burger}
            />
          }
          itemsBeforeDivider={[
            { name: 'For you' },
            { name: 'Following' },
            { name: 'Liked' },
            { name: 'Saved' },
          ]}
          itemsAfterDivider={[{ name: 'Log out', color: 'red' }]}
        />
      )}
    </Flex>
  );
}
