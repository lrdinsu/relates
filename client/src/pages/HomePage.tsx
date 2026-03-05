import { PostList } from '@/features/posts/components/PostList/PostList.tsx';
import { useAuthStore } from '@/stores/authStore.ts';

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <PostList endpoint={isAuthenticated ? '/for-you' : '/hot'} />;
}
