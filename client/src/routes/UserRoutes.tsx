export const UserRoutes = () => [
  {
    path: 'profile',
    async lazy() {
      const { UserPage } = await import('../pages/UserPage.tsx');
      return { Component: UserPage };
    },
  },
];
