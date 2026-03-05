import { modals } from '@mantine/modals';
import { CreatePost } from '@/features/posts/components/CreatePost/CreatePost.tsx';
import { Post } from '@/features/posts/hooks/usePostList.ts';

export function useEditPostModal() {
  return (post: Post) =>
    modals.open({
      title: 'Edit Post',
      children: (
        <CreatePost
          editingPost={post}
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
