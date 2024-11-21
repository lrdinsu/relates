import { Flex } from '@mantine/core';

import { NavBarLinks } from '../NavBarLinks/NavBarLinks.tsx';

export function Footer() {
  return (
    <Flex justify="space-between" align="center" p={5}>
      <NavBarLinks />
    </Flex>
  );
}
