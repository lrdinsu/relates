import { useEffect } from 'react';

import { PostList } from '@/features/posts/components/PostList/PostList.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { useTitleStore } from '@/stores/titleStore.ts';

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setTitle = useTitleStore((state) => state.setTitle);

  useEffect(() => {
    setTitle(isAuthenticated ? 'For you' : 'Home');
  }, [setTitle, isAuthenticated]);

  return <PostList />;
}
