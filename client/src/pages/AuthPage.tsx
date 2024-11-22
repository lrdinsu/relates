import { Outlet } from 'react-router-dom';

import { Container } from '@mantine/core';

export function AuthPage() {
  return (
    <>
      <Container size={420}>
        <Outlet />
      </Container>
    </>
  );
}
