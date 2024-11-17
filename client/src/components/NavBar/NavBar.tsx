import { useState } from 'react';

import { Stack, Tooltip, UnstyledButton, rem } from '@mantine/core';
// import { MantineLogo } from '@mantinex/mantine-logo';
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
} from '@tabler/icons-react';

import classes from './NavBar.module.css';

type NavbarLinkProps = {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  handleClick?: () => void;
};

function NavbarLink({
  icon: Icon,
  label,
  active,
  handleClick,
}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={handleClick}
        className={classes.link}
        data-active={active ?? undefined}
      >
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Home' },
  { icon: IconGauge, label: 'Dashboard' },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
  { icon: IconCalendarStats, label: 'Releases' },
  { icon: IconUser, label: 'Account' },
  { icon: IconFingerprint, label: 'Security' },
  { icon: IconSettings, label: 'Settings' },
];

export function NavBar() {
  const [active, setActive] = useState(2);

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      handleClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      {/*<Center>*/}
      {/*  <MantineLogo type="mark" inverted size={30} />*/}
      {/*</Center>*/}

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconSwitchHorizontal} label="Change account" />
        <NavbarLink icon={IconLogout} label="Logout" />
      </Stack>
    </nav>
  );
}
