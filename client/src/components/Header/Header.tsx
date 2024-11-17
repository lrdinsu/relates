import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation.ts';
import { Button } from '@mantine/core';

import { Logo } from '../Logo/Logo.tsx';

export function Header() {
  const mutation = useLogoutMutation();

  function handleLogout() {
    mutation.mutate();
  }

  return (
    <div>
      <Logo />
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}
