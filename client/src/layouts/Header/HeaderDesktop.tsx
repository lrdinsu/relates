import { BackButton } from '@/components/BackButton/BackButton.tsx';
import { DropdownMenu } from '@/components/DropdownMenu/DropdownMenu.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { useTitleStore } from '@/stores/titleStore.ts';
import { ActionIcon, Flex, UnstyledButton } from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';

import classes from './Header.module.css';

export function HeaderDesktop() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const title = useTitleStore((state) => state.title);

  return (
    <Flex
      justify="center"
      align="center"
      p="md"
      gap={10}
      className={classes.header}
    >
      <BackButton />
      <UnstyledButton>{title}</UnstyledButton>
      {isAuthenticated && (
        <DropdownMenu
          target={
            <ActionIcon radius={100} className={classes.dropdownIcon} size={24}>
              <IconArrowDown size={16} />
            </ActionIcon>
          }
          itemsBeforeDivider={[
            { name: 'For you', path: '/for-you' },
            { name: 'Following', path: '/following' },
            { name: 'Liked', path: '/liked' },
            { name: 'Saved', path: '/saved' },
          ]}
          itemsAfterDivider={[
            {
              name: 'Create new post',
              onClick: () => {
                /*TODO*/
              },
            },
          ]}
        />
      )}
    </Flex>
  );
}
