import { useNavigate } from 'react-router-dom';

import { useLoginModal } from '@/hooks/useLoginModal.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { useTitleStore } from '@/stores/titleStore.ts';
import { UnstyledButton, rem } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

import classes from './NavBarLinks.module.css';

type NavbarLinkProps = {
  icon: typeof IconHome;
  path: string;
  active?: boolean;
  onClick: () => void;
  needAuth?: boolean;
};

export function NavBarLink({
  icon: Icon,
  path,
  active,
  onClick,
  needAuth,
}: NavbarLinkProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setTitle = useTitleStore((state) => state.setTitle);
  const openLoginModal = useLoginModal();

  const handleClick = () => {
    onClick();

    if (needAuth && !isAuthenticated) {
      openLoginModal();
    } else {
      if (path) {
        navigate(path);
        if (path !== '/') {
          setTitle(path[1].toUpperCase() + path.slice(2));
        }
      }
    }
  };

  return (
    <UnstyledButton
      onClick={handleClick}
      className={classes.link}
      data-active={active ? true : undefined}
    >
      <Icon style={{ width: rem(30), height: rem(30) }} stroke={1.5} />
    </UnstyledButton>
  );
}
