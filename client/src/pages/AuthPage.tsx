import { Outlet } from 'react-router-dom';

import { Container } from '@mantine/core';

function AuthPage() {
  return (
    <>
      <Container size={420}>
        <Outlet />
      </Container>
    </>
  );
}

export default AuthPage;
