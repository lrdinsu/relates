const PostsRoutes = () => [
  {
    path: 'hot',
    async lazy() {
      const { PostList } = await import(
        '../features/posts/components/PostList/PostList.tsx'
      );
      return { Component: PostList };
    },
  },
  ...['for-you', 'following', 'liked', 'saved'].map((path) => ({
    path,
    async lazy() {
      const { PostList } = await import(
        '../features/posts/components/PostList/PostList.tsx'
      );
      const { ProtectedRoute } = await import('./ProtectedRoute.tsx');
      return {
        Component: () => (
          <ProtectedRoute>
            <PostList />
          </ProtectedRoute>
        ),
      };
    },
  })),
];

export default PostsRoutes;
