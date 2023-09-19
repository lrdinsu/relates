import { Route, Routes } from 'react-router-dom';

import { Header } from '@/components/Header.tsx';
import { PostPage } from '@/pages/PostPage.tsx';
import { UserPage } from '@/pages/UserPage.tsx';
import { Container } from '@mantine/core';

function App() {
  return (
    <Container size={620}>
      <Header />
      <Routes>
        <Route path="/:username" element={<UserPage />} />
        <Route path="/:username/post/:pid" element={<PostPage />} />
      </Routes>
    </Container>
  );
}

export default App;
