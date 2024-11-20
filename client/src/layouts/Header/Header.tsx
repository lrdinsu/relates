import { Container } from '@mantine/core';

import { HeaderDesktop } from './HeaderDesktop.tsx';
import { HeaderMobile } from './HeaderMobile.tsx';

export function Header() {
  return (
    <>
      <Container size={640} visibleFrom="sm">
        <HeaderDesktop />
      </Container>
      <Container hiddenFrom="sm">
        <HeaderMobile />
      </Container>
    </>
  );
}
