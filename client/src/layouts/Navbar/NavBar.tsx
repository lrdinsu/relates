import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo/Logo.tsx';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import {
  Center,
  Stack,
  useComputedColorScheme,
  useMantineColorScheme,
  Menu,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { IconLogout, IconSun, IconMoon, IconMenu2, IconBookmark } from '@tabler/icons-react';

import { NavBarLinks } from '../NavBarLinks/NavBarLinks.tsx';
import classes from './NavBarButtons.module.css';

export function NavBar() {
  const navigate = useNavigate();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };
  const mutation = useLogoutMutation();
  
  function handleLogout() {
    mutation.mutate();
  }

  return (
    <>
      <Center mb={40}>
        <Logo />
      </Center>
      <Stack justify="center" gap={10} flex={1}>
        <NavBarLinks />
      </Stack>
      <Stack justify="center" gap={0}>
        <Menu shadow="md" width={200} position="right-end" offset={10}>
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
      </Stack>
    </>
  );
}
