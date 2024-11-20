import { AppShell, Container } from '@mantine/core';

import { Footer } from '../Footer/Footer.tsx';
import { Header } from '../Header/Header.tsx';
import { NavBar } from '../Navbar/NavBar.tsx';
import classes from './AppLayout.module.css';

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  // const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      layout="alt"
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      <AppShell.Header className={classes.header} withBorder={false}>
        {/*<Group h="100%" px="md">*/}
        {/*  <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />*/}
        {/*  <Text>Home</Text>*/}
        {/*  <Text>Log in</Text>*/}
        {/*</Group>*/}
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
        <AppShell.Main className={classes.main}>{children}</AppShell.Main>
      </Container>
      <AppShell.Footer hiddenFrom="sm" withBorder={false}>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
