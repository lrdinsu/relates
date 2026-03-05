export const PostsRoutes = () => [
  {
    path: 'hot',
    async lazy() {
      const { PostList } = await import(
        '../features/posts/components/PostList/PostList.tsx'
      );
      return { Component: PostList };
    },
  },
  {
    path: 'liked',
    async lazy() {
      const { PostList } = await import(
        '../features/posts/components/PostList/PostList.tsx'
      );
      const { ProtectedRoute } = await import('./ProtectedRoute.tsx');
      return {
        Component: () => (
          <ProtectedRoute>
            <PostList endpoint="/liked" />
          </ProtectedRoute>
        ),
      };
    },
  },
  {
    path: 'posts/:postId',
    async lazy() {
      const { PostPage } = await import('../pages/PostPage.tsx');
      return { Component: PostPage };
    },
  },
];
