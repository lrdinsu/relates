import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/AppLayout/AppLayout.tsx';
import { ForgotPassword } from '@/features/auth/components/ForgetPassword/ForgotPassword.tsx';
import { Login } from '@/features/auth/components/Login/Login.tsx';
import { Signup } from '@/features/auth/components/Signup/Signup.tsx';
import { useAccessToken } from '@/hooks/useAccessToken.ts';
import AuthPage from '@/pages/AuthPage.tsx';
import HomePage from '@/pages/HomePage.tsx';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage.tsx';
import PostPage from '@/pages/PostPage.tsx';
import UserPage from '@/pages/UserPage.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { Loader } from '@mantine/core';

function App() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { isPending, isError } = useAccessToken();

  useEffect(() => {
    if (isError) {
      setAccessToken(null);
    }
  }, [isError, setAccessToken]);

  if (isPending) {
    return <Loader />;
  }

  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppLayout>
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
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
