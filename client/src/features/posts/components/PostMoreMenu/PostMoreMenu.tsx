import { useLocation, useNavigate } from 'react-router-dom';

import { useEditPostModal } from '@/hooks/useEditPostModal.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { ActionIcon, Menu, Text, rem } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';

import { useDeletePost } from '../../hooks/useDeletePost.ts';
import { Post } from '../../hooks/usePostList.ts';

type PostMoreMenuProps = {
  post: Post;
};

export function PostMoreMenu({ post }: PostMoreMenuProps) {
  const currentUser = useAuthStore((state) => state.userData);
  const deletePostMutation = useDeletePost();
  const openEditPostModal = useEditPostModal();
  const location = useLocation();
  const navigate = useNavigate();

  const isMe = currentUser?.username === post.postedBy.username;

  if (!isMe) return null;

  const handleDelete = () => {
    modals.openConfirmModal({
      title: 'Delete post',
      children: (
        <Text size="sm">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red', radius: 'xl' },
      cancelProps: { radius: 'xl' },
      onConfirm: () => {
        deletePostMutation.mutate(post.id, {
          onSuccess: () => {
            // If we are on the post detail page, navigate back
            if (location.pathname === `/posts/${post.id}`) {
              if (window.history.length > 1) {
                void navigate(-1);
              } else {
                void navigate('/');
              }
            }
          },
        });
      },
    });
  };

  return (
    <Menu shadow="md" width={160} position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="xl"
          onClick={(e) => e.stopPropagation()}
        >
          <IconDots style={{ width: rem(18), height: rem(18) }} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
        <Menu.Item
          leftSection={<IconEdit style={{ width: rem(16), height: rem(16) }} />}
          onClick={() => openEditPostModal(post)}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          color="red"
          leftSection={
            <IconTrash style={{ width: rem(16), height: rem(16) }} />
          }
          onClick={handleDelete}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
