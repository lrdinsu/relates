import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Flex, Image, Text } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';

import { Actions } from '../Actions/Actions.tsx';
import { LeftBar } from '../LeftBar/LeftBar.tsx';
import styles from './Post.module.css';

type postProps = {
  likes: number;
  replies: number;
  postImg?: string;
  postText: string;
};

export function Post({ likes, replies, postImg, postText }: postProps) {
  const [liked, setLiked] = useState(false);

  return (
    <Link to="/kellie/post/1" className={styles.post}>
      <Flex gap={12} mb={16} py={20}>
        <LeftBar />

        <Flex direction="column" gap={8} className={styles.postContent}>
          <Flex justify="space-between" w="100%">
            <Flex w="100%" align="center">
              <Text size="sm" fw="bold">
                kelliesmith
              </Text>
              <Image src="/verified.webp" w={16} h={16} ml={4} />
            </Flex>

            <Flex gap={16} align="center">
              <Text size="sm" c="gray.6">
                1d
              </Text>
              <IconDots />
            </Flex>
          </Flex>

          <Text size="sm">{postText}</Text>
          {postImg && <Image src={postImg} w="100%" radius="md" />}

          <Flex gap={12} my={4}>
            <Actions liked={liked} setLiked={setLiked} />
          </Flex>

          <Flex gap={8} align="center" c="gray.6">
            <Text size="sm">{replies} replies</Text>
            <Text>&bull;</Text>
            <Text size="sm">{likes} likes</Text>
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
}
