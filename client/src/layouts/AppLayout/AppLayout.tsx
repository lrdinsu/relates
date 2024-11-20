import { LoginButton } from '@/components/LoginButton/LoginButton.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { AppShell, Container } from '@mantine/core';

import { Footer } from '../Footer/Footer.tsx';
import { Header } from '../Header/Header.tsx';
import { NavBar } from '../Navbar/NavBar.tsx';
import classes from './AppLayout.module.css';

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <AppShell
      layout="alt"
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header className={classes.header} withBorder={false}>
        <Header />
      </AppShell.Header>
      {!isAuthenticated && <LoginButton />}
      <AppShell.Navbar
        p="md"
        visibleFrom="sm"
        withBorder={false}
        className={classes.navbar}
      >
        <NavBar />
      </AppShell.Navbar>
      <Container size={640} className={classes.container}>
        <AppShell.Main className={classes.main}>{children}</AppShell.Main>
      </Container>
      <AppShell.Footer hiddenFrom="sm" withBorder={false}>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
