import { Logo } from '@/components/Logo/Logo.tsx';
import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation.ts';
import {
  Center,
  Stack,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconLogout, IconSun } from '@tabler/icons-react';

import { NavBarLink } from '../NavBarLinks/NavBarLink.tsx';
import { NavBarLinks } from '../NavBarLinks/NavBarLinks.tsx';

export function NavBar() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark');
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
        <NavBarLink icon={IconSun} label="theme" onClick={toggleColorScheme} />
        <NavBarLink icon={IconLogout} label="Log out" onClick={handleLogout} />
      </Stack>
    </>
  );
}
