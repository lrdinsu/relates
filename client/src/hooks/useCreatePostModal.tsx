import { modals } from '@mantine/modals';

import { CreatePost } from '@/features/posts/components/CreatePost/CreatePost.tsx';
import { Post } from '@/features/posts/hooks/usePostList.ts';

export function useCreatePostModal() {
  return (parentPost?: Post) =>
    modals.open({
      title: parentPost ? 'Reply' : 'Create Post',
      children: (
        <CreatePost
          parentPost={parentPost}
          onClose={() => modals.closeAll()}
        />
      ),
      size: 'lg',
      radius: 'md',
      withCloseButton: true,
      styles: {
        title: {
          fontWeight: 700,
        },
      },
    });
}
