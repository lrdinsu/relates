import { Logo } from '@/components/Logo/Logo.tsx';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import {
  Center,
  Stack,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconLogout, IconSun } from '@tabler/icons-react';

import { NavBarLinks } from '../NavBarLinks/NavBarLinks.tsx';
import { NavBarButtons } from './NavBarButtons.tsx';

export function NavBar() {
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
        <NavBarButtons icon={IconSun} onClick={toggleColorScheme} />
        {isAuthenticated && (
          <NavBarButtons icon={IconLogout} onClick={handleLogout} />
        )}
      </Stack>
    </>
  );
}
