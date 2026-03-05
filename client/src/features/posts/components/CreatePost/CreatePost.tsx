import { useState, useCallback } from 'react';

import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import {
  Button,
  Flex,
  Textarea,
  ActionIcon,
  Image,
  Stack,
  Text,
  Group,
  SimpleGrid,
  TextInput,
  Popover,
  Divider,
  Box,
  CloseButton,
} from '@mantine/core';
import { IconPhoto, IconPlus } from '@tabler/icons-react';
import { isAxiosError } from 'axios';

import { useCreatePost } from '../../hooks/useCreatePost.ts';
import { Post } from '../../hooks/usePostList.ts';
import { PostContent } from '../PostContent/PostContent.tsx';
import { convertPostTime } from '@/utils/convertPostTime.ts';

import classes from './CreatePost.module.css';

const MAX_IMAGES = 4;

type CreatePostProps = {
  parentPost?: Post;
  inline?: boolean;
  onClose?: () => void;
};

export function CreatePost({ parentPost, inline, onClose }: CreatePostProps) {
  const userData = useAuthStore((state) => state.userData);
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPostMutation = useCreatePost();

  const handleCreatePost = async () => {
    if (!text.trim() && images.length === 0) return;
    setError(null);

    try {
      await createPostMutation.mutateAsync({
        text: text.trim(),
        images,
        parentPostId: parentPost?.id,
      });
      setText('');
      setImages([]);
      if (onClose) onClose();
    } catch (err: unknown) {
      if (isAxiosError<{ message: string }>(err)) {
        setError(err.response?.data?.message ?? 'Failed to create post');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Failed to create post:', err);
    }
  };

  const addImageUrl = useCallback(() => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    if (images.length >= MAX_IMAGES) {
      setError(`You can attach up to ${MAX_IMAGES} images`);
      return;
    }

    if (images.includes(trimmed)) {
      setError('Image already added');
      return;
    }

    setImages((prev) => [...prev, trimmed]);
    setImageUrl('');
    setImagePopoverOpen(false);
    setError(null);
  }, [imageUrl, images]);

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const isReply = !!parentPost;

  return (
    <Stack gap={0} className={inline ? classes.inlineContainer : ''}>
      {isReply && !inline && (
        <Flex gap={12} className={classes.parentPostPreview}>
          <Box className={classes.leftColumn}>
             <UserPic
               username={parentPost.postedBy.username}
               avatar={parentPost.postedBy.profilePic}
             />
          </Box>
          <Stack gap={0} style={{ flex: 1 }}>
            <Group gap={4} align="center">
              <Text size="sm" fw="bold">
                {parentPost.postedBy.name}
              </Text>
              <Text size="xs" c="gray.6">
                @{parentPost.postedBy.username}
              </Text>
              <Text size="xs" c="gray.6">
                ·
              </Text>
              <Text size="xs" c="gray.6">
                {convertPostTime(new Date(parentPost.createdAt))}
              </Text>
            </Group>
            <PostContent postText={parentPost.text} />
            <Text size="sm" c="dimmed" mt={8}>
              Replying to <span className={classes.replyTo}>@{parentPost.postedBy.username}</span>
            </Text>
          </Stack>
        </Flex>
      )}

      {isReply && !inline && <Divider mt="sm" mb="md" mx={-20} />}

      <Flex gap={12} pt={isReply && !inline ? 0 : 0}>
        <Box className={classes.leftColumn}>
          <UserPic
            username={userData?.username ?? ''}
            avatar={userData?.profilePic ?? ''}
          />
        </Box>
        <Stack gap={12} style={{ flex: 1 }}>
          <Textarea
            autosize
            minRows={inline ? 1 : 3}
            placeholder={isReply ? "Post your reply" : "What is happening?!"}
            className={classes.postInput}
            variant="unstyled"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
          />

          {images.length > 0 && (
            <SimpleGrid cols={images.length === 1 ? 1 : 2} spacing="xs">
              {images.map((url) => (
                <Box key={url} pos="relative">
                  <Image
                    src={url}
                    alt="attachment"
                    radius="md"
                    h={images.length === 1 ? 260 : 160}
                    fit="cover"
                    fallbackSrc="https://placehold.co/400x300?text=Invalid+URL"
                  />
                  <CloseButton
                    size="sm"
                    variant="filled"
                    pos="absolute"
                    top={6}
                    right={6}
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className={classes.removeImageIcon}
                  />
                </Box>
              ))}
            </SimpleGrid>
          )}

          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}

          <Group justify="space-between" mt="sm">
            <Popover
              opened={imagePopoverOpen}
              onChange={setImagePopoverOpen}
              width={300}
              position="bottom-start"
              shadow="md"
              withArrow
            >
              <Popover.Target>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="lg"
                  onClick={() => setImagePopoverOpen((o) => !o)}
                  radius="xl"
                  disabled={images.length >= MAX_IMAGES}
                >
                  <IconPhoto size={20} />
                </ActionIcon>
              </Popover.Target>

              <Popover.Dropdown>
                <Text size="xs" fw={500} mb={6}>
                  Paste image URL
                </Text>
                <Group gap={8}>
                  <TextInput
                    placeholder="https://example.com/image.jpg"
                    size="xs"
                    style={{ flex: 1 }}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    autoFocus
                  />
                  <ActionIcon
                    size="sm"
                    radius="xl"
                    onClick={addImageUrl}
                    variant="filled"
                    disabled={!imageUrl.trim()}
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Group>
              </Popover.Dropdown>
            </Popover>

            <Button
              className={classes.submitButton}
              onClick={handleCreatePost}
              loading={createPostMutation.isPending}
              disabled={(!text.trim() && images.length === 0) || createPostMutation.isPending}
              radius="xl"
            >
              {isReply ? 'Reply' : 'Post'}
            </Button>
          </Group>
        </Stack>
      </Flex>
    </Stack>
  );
}
