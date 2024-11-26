import { createBrowserRouter } from 'react-router-dom';

import { Loading } from '@/components/Loading/Loading.tsx';

import { AuthRoutes } from './AuthRoutes.tsx';
import { PostsRoutes } from './PostsRoutes.tsx';
import { UserRoutes } from './UserRoutes.tsx';

const router = createBrowserRouter(
  [
    {
      path: '/',
      async lazy() {
        const { AppLayout } = await import(
          '../layouts/AppLayout/AppLayout.tsx'
        );
        return { Component: AppLayout };
      },
      hydrateFallbackElement: <Loading />,
      children: [
        {
          index: true,
          async lazy() {
            const { HomePage } = await import('../pages/HomePage.tsx');
            return { Component: HomePage };
          },
          hydrateFallbackElement: <Loading />,
        },
        ...PostsRoutes(),
        ...UserRoutes(),
        {
          path: '*',
          async lazy() {
            const { NotFoundPage } = await import(
              '../pages/NotFoundPage/NotFoundPage.tsx'
            );
            return { Component: NotFoundPage };
          },
          hydrateFallbackElement: <Loading />,
        },
      ],
    },
    ...AuthRoutes(),
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

export default router;
