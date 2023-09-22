import { useState } from 'react';

import { Avatar, Divider, Flex, Text } from '@mantine/core';

import { PostActions } from '../../posts/PostActions/PostActions.tsx';
import { PostContent } from '../../posts/PostContent/PostContent.tsx';
import { PostHeader } from '../../posts/PostHeader/PostHeader.tsx';
import { PostMain } from '../../posts/PostMain/PostMain.tsx';

type CommentItemProps = {
  comment: string;
  createdAt: string;
  likes: number;
  userName: string;
  userAvatar?: string;
};

export function CommentItem({
  comment,
  createdAt,
  likes,
  userName,
  userAvatar,
}: CommentItemProps) {
  const [liked, setLiked] = useState(false);

  return (
    <>
      <Flex gap={16} py={8} w="100%">
        <Avatar size="sm" src={userAvatar} alt={userName}>
          {userName.slice(0, 2).toUpperCase()}
        </Avatar>
        <PostMain gap={4}>
          <PostHeader createdAt={createdAt} userName={userName} />
          <PostContent postText={comment} />
          <PostActions liked={liked} setLiked={setLiked} />
          <Text size="xs" c="gray.6" my={-6}>
            {likes + (liked ? 1 : 0)} likes
          </Text>
        </PostMain>
      </Flex>
      <Divider my={16} />
    </>
  );
}
