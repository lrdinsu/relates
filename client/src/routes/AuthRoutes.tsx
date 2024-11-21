import { RouteObject } from 'react-router-dom';

import { ForgotPassword } from '@/features/auth/components/ForgetPassword/ForgotPassword.tsx';
import { Login } from '@/features/auth/components/Login/Login.tsx';
import { Signup } from '@/features/auth/components/Signup/Signup.tsx';
import AuthPage from '@/pages/AuthPage';

const AuthRoutes = (): RouteObject[] => [
  {
    path: '/',
    element: <AuthPage />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },
];

export default AuthRoutes;
