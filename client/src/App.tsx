import { Route, Routes } from 'react-router-dom';

import { Header } from '@/components/Header.tsx';
import AuthPage from '@/pages/AuthPage.tsx';
import HomePage from '@/pages/HomePage.tsx';
import PostPage from '@/pages/PostPage.tsx';
import UserPage from '@/pages/UserPage.tsx';
import { Container } from '@mantine/core';

function App() {
  return (
    <Container size={620}>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/forgotpassword" element={<AuthPage />} />
        <Route path="/:username" element={<UserPage />} />
        <Route path="/:username/post/:pid" element={<PostPage />} />
      </Routes>
    </Container>
  );
}

export default App;
