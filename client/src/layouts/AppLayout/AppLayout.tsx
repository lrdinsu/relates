import { Suspense } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';

import { Loading } from '@/components/Loading/Loading.tsx';
import { LoginButton } from '@/components/LoginButton/LoginButton.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { AppShell, Container } from '@mantine/core';

import { Footer } from '../Footer/Footer.tsx';
import { Header } from '../Header/Header.tsx';
import { NavBar } from '../Navbar/NavBar.tsx';
import classes from './AppLayout.module.css';

export function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const navigation = useNavigation();

  return (
    <>
      {navigation.state === 'loading' && <Loading />}

      <AppShell
        layout="alt"
        padding="md"
        transitionDuration={500}
        transitionTimingFunction="ease"
      >
        {!isAuthenticated && location.pathname !== '/login' && <LoginButton />}

        <AppShell.Header className={classes.header} withBorder={false}>
          <Header />
        </AppShell.Header>

        <AppShell.Navbar
          p="md"
          visibleFrom="sm"
          withBorder={false}
          className={classes.navbar}
        >
          <NavBar />
        </AppShell.Navbar>

        <Container size={640} className={classes.container}>
          <AppShell.Main className={classes.main}>
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </AppShell.Main>
        </Container>

        <AppShell.Footer hiddenFrom="sm" withBorder={false}>
          <Footer />
        </AppShell.Footer>
      </AppShell>
    </>
  );
}
