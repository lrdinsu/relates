import { useNavigate } from 'react-router-dom';
import { Flex, Menu, UnstyledButton, rem, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMenu2, IconSun, IconMoon, IconLogout, IconBookmark } from '@tabler/icons-react';

import { NavBarLinks } from '../NavBarLinks/NavBarLinks.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation.ts';
import classes from '../Navbar/NavBarButtons.module.css';

export function Footer() {
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mutation = useLogoutMutation();

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  function handleLogout() {
    mutation.mutate();
  }

  return (
    <Flex justify="space-between" align="center" p={5}>
      <NavBarLinks />
      <Menu shadow="md" width={200} position="top-end" offset={10}>
        <Menu.Target>
          <UnstyledButton className={classes.button}>
            <IconMenu2 style={{ width: rem(30), height: rem(30) }} stroke={1.5} />
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          {isAuthenticated && (
            <Menu.Item 
              leftSection={<IconBookmark style={{ width: rem(16), height: rem(16) }} />}
              onClick={() => navigate('/saved')}
            >
              Saved
            </Menu.Item>
          )}
          <Menu.Item 
            leftSection={computedColorScheme === 'dark' ? 
              <IconSun style={{ width: rem(16), height: rem(16) }} /> : 
              <IconMoon style={{ width: rem(16), height: rem(16) }} />
            }
            onClick={toggleColorScheme}
          >
            Appearance
          </Menu.Item>
          {isAuthenticated && (
            <>
              <Menu.Divider />
              <Menu.Item 
                color="red"
                leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                onClick={handleLogout}
              >
                Log out
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </Flex>
  );
}
