import { useState } from 'react';

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
  Collapse,
  Divider,
} from '@mantine/core';
import { IconPhoto, IconPlus, IconX } from '@tabler/icons-react';

import { useCreatePost } from '../../hooks/useCreatePost.ts';
import { Post } from '../../hooks/usePostList.ts';
import { PostContent } from '../PostContent/PostContent.tsx';
import { convertPostTime } from '@/utils/convertPostTime.ts';

import classes from './CreatePost.module.css';

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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const createPostMutation = useCreatePost();

  const handleCreatePost = async () => {
    if (!text && images.length === 0) return;

    try {
      await createPostMutation.mutateAsync({
        text,
        images,
        parentPostId: parentPost?.id,
      });
      setText('');
      setImages([]);
      setShowUrlInput(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
      setShowUrlInput(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isReply = !!parentPost;

  return (
    <Stack gap={0} className={inline ? classes.inlineContainer : ''}>
      {isReply && !inline && (
        <Flex gap={12} className={classes.parentPostPreview}>
          <Stack align="center" gap={0}>
             <UserPic
               username={parentPost.postedBy.username}
               avatar={parentPost.postedBy.profilePic}
             />
             <div className={classes.verticalLine} />
          </Stack>
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap={8}>
              <Text size="sm" fw="bold">
                {parentPost.postedBy.username}
              </Text>
              <Text size="sm" c="gray.6">
                {convertPostTime(new Date(parentPost.createdAt))}
              </Text>
            </Group>
            <PostContent postText={parentPost.text} />
            <Text size="sm" color="dimmed" mt={8}>
              Replying to <span className={classes.replyTo}>@{parentPost.postedBy.username}</span>
            </Text>
          </Stack>
        </Flex>
      )}

      {isReply && !inline && <Divider my="sm" mx={-20} />}

      <Flex gap={12} pt={isReply && !inline ? 0 : 0}>
        <UserPic
          username={userData?.username ?? ''}
          avatar={userData?.profilePic ?? ''}
        />
        <Stack gap={12} style={{ flex: 1 }}>
          <Textarea
            autosize
            minRows={inline ? 1 : 3}
            placeholder={isReply ? "Post your reply" : "What is happening?!"}
            className={classes.postInput}
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
          />

          {images.length > 0 && (
            <SimpleGrid cols={images.length > 1 ? 2 : 1} spacing="xs">
              {images.map((src, index) => (
                <div key={index} className={classes.imagePreviewContainer}>
                  <Image src={src} radius="md" />
                  <ActionIcon
                    variant="filled"
                    color="rgba(0,0,0,0.6)"
                    className={classes.removeImageIcon}
                    onClick={() => removeImage(index)}
                    radius="xl"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </div>
              ))}
            </SimpleGrid>
          )}

          <Collapse in={showUrlInput}>
            <Group gap={8} mt="xs">
              <TextInput
                placeholder="Paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.currentTarget.value)}
                style={{ flex: 1 }}
                size="xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                autoFocus
              />
              <ActionIcon
                variant="light"
                color="blue"
                onClick={addImageUrl}
                radius="xl"
                size="lg"
                disabled={!imageUrl.trim()}
              >
                <IconPlus size={20} />
              </ActionIcon>
            </Group>
          </Collapse>

          <Group justify="space-between" mt="sm">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => setShowUrlInput((prev) => !prev)}
              radius="xl"
              size="lg"
            >
              <IconPhoto size={20} />
            </ActionIcon>

            <Button
              className={classes.submitButton}
              onClick={handleCreatePost}
              loading={createPostMutation.isPending}
              disabled={!text && images.length === 0}
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
