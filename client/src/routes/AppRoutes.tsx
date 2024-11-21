import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout/AppLayout.tsx';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage.tsx';
import PostPage from '@/pages/PostPage';

import AuthRoutes from './AuthRoutes.tsx';
import PostRoutes from './PostRoutes.tsx';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <HomePage /> },
        ...PostRoutes(),
        ...AuthRoutes(),
        { path: 'posts/:postId', element: <PostPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
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
