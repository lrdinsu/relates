import { UnstyledButton, rem } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

import classes from './NavBarButtons.module.css';

type NavBarButtonsProps = {
  icon: typeof IconHome;
  onClick: () => void;
};

export function NavBarButtons({ icon: Icon, onClick }: NavBarButtonsProps) {
  return (
    <UnstyledButton onClick={onClick} className={classes.button}>
      <Icon style={{ width: rem(30), height: rem(30) }} stroke={1.5} />
    </UnstyledButton>
  );
}
