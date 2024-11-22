const AuthRoutes = () => [
  {
    path: '/',
    async lazy() {
      const { AuthPage } = await import('../pages/AuthPage.tsx');
      return { Component: AuthPage };
    },
    children: [
      {
        path: 'login',
        async lazy() {
          const { Login } = await import(
            '../features/auth/components/Login/Login.tsx'
          );
          return { Component: Login };
        },
      },
      {
        path: 'signup',
        async lazy() {
          const { Signup } = await import(
            '../features/auth/components/Signup/Signup.tsx'
          );
          return { Component: Signup };
        },
      },
      {
        path: 'forgot-password',
        async lazy() {
          const { ForgotPassword } = await import(
            '../features/auth/components/ForgetPassword/ForgotPassword.tsx'
          );
          return { Component: ForgotPassword };
        },
      },
    ],
  },
];

export default AuthRoutes;
