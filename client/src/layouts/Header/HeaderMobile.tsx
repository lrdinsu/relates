import { BackButton } from '@/components/BackButton/BackButton.tsx';
import { DropdownMenu } from '@/components/DropdownMenu/DropdownMenu.tsx';
import { Logo } from '@/components/Logo/Logo.tsx';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { Burger, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import classes from './Header.module.css';

export function HeaderMobile() {
  const [opened, { toggle }] = useDisclosure();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mutation = useLogoutMutation();

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
            { name: 'For you', path: '/for-you' },
            { name: 'Following', path: '/following' },
            { name: 'Liked', path: '/liked' },
            { name: 'Saved', path: '/saved' },
          ]}
          itemsAfterDivider={[
            {
              name: 'Log out',
              color: 'red',
              onClick: () => {
                mutation.mutate();
              },
            },
          ]}
        />
      )}
    </Flex>
  );
}
