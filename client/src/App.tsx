import { Route, Routes } from 'react-router-dom';

import { Header } from '@/components/Header.tsx';
import { ForgotPassword } from '@/features/auth/ForgetPassword/ForgotPassword.tsx';
import { Login } from '@/features/auth/Login/Login.tsx';
import { Signup } from '@/features/auth/Signup/Signup.tsx';
import AuthPage from '@/pages/AuthPage.tsx';
import HomePage from '@/pages/HomePage.tsx';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage.tsx';
import PostPage from '@/pages/PostPage.tsx';
import UserPage from '@/pages/UserPage.tsx';
import { Container } from '@mantine/core';

function App() {
  return (
    <Container size={620}>
      <Header />
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Nested Auth Routes */}
        <Route path="/" element={<AuthPage />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* User Pages */}
        <Route path="/:username" element={<UserPage />} />
        <Route path="/:username/post/:pid" element={<PostPage />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Container>
  );
}

export default App;
