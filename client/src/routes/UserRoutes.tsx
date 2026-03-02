import { LoaderFunctionArgs, redirect } from 'react-router-dom';

import { Loading } from '@/components/Loading/Loading.tsx';
import { useAuthStore } from '@/stores/authStore.ts';

export const UserRoutes = () => [
  {
    path: 'profile/:tab?',
    loader: ({ params }: LoaderFunctionArgs) => {
      const tab = params.tab == 'comments' ? 'comments' : 'posts';
      const username = useAuthStore.getState().userData?.username;

      if (!username) {
        return redirect('/login');
      }

      return redirect(`/user/${username}/${tab}`);
    },
    hydrateFallbackElement: <Loading />,
  },

  {
    path: 'user/:username/:tab?',
    async lazy() {
      const { UserPage } = await import('../pages/UserPage.tsx');
      return { Component: UserPage };
    },
    hydrateFallbackElement: <Loading />,
  },
];
