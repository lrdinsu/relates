import { Container, Flex } from '@mantine/core';

import { Header } from '../Header/Header.tsx';
import { NavBar } from '../NavBar/NavBar.tsx';

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Flex>
      <NavBar />
      <Container size={620}>
        <Header />
        <main>{children}</main>
      </Container>
    </Flex>
  );
}
