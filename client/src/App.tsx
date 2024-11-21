import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute.tsx';
import { ForgotPassword } from '@/features/auth/components/ForgetPassword/ForgotPassword.tsx';
import { Login } from '@/features/auth/components/Login/Login.tsx';
import { Signup } from '@/features/auth/components/Signup/Signup.tsx';
import { PostList } from '@/features/posts/components/PostList/PostList.tsx';
import { useAccessToken } from '@/hooks/useAccessToken.ts';
import AuthPage from '@/pages/AuthPage.tsx';
import HomePage from '@/pages/HomePage.tsx';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage.tsx';
import PostPage from '@/pages/PostPage.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { Loader } from '@mantine/core';

import { AppLayout } from './layouts/AppLayout/AppLayout.tsx';

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
          {/*Home Page*/}
          <Route path="/" element={<HomePage />} />

          {/*Posts Page*/}
          <Route path="/hot" element={<PostList />} />
          <Route
            path="/for-you"
            element={
              <ProtectedRoute>
                <PostList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/following"
            element={
              <ProtectedRoute>
                <PostList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/liked"
            element={
              <ProtectedRoute>
                <PostList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <PostList />
              </ProtectedRoute>
            }
          />

          {/* Nested Auth Routes */}
          <Route path="/" element={<AuthPage />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* User Pages */}
          {/*<Route path="/:username" element={<UserPage />} />*/}
          <Route path="/:username/post/:pid" element={<PostPage />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
