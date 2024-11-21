import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { Loading } from '@/components/Loading/Loading.tsx';
import { useAccessToken } from '@/hooks/useAccessToken.ts';
import router from '@/routes/AppRoutes.tsx';
import { useAuthStore } from '@/stores/authStore.ts';

function App() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { isPending, isError } = useAccessToken();

  useEffect(() => {
    if (isError) {
      setAccessToken(null);
    }
  }, [isError, setAccessToken]);

  if (isPending) {
    return <Loading />;
  }

  return <RouterProvider router={router} />;
}

export default App;
