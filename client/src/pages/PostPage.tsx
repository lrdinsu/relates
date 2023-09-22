import { useState } from 'react';

import { AddComment } from '@/features/comments/AddComment/AddComment.tsx';
import { CommentItem } from '@/features/comments/CommentItem/CommentItem.tsx';
import { PostActions } from '@/features/posts/PostActions/PostActions.tsx';
import { PostContent } from '@/features/posts/PostContent/PostContent.tsx';
import { PostHeader } from '@/features/posts/PostHeader/PostHeader.tsx';
import { PostMain } from '@/features/posts/PostMain/PostMain.tsx';
import { PostStats } from '@/features/posts/PostStats/PostStats.tsx';
import { Avatar, Flex } from '@mantine/core';

function PostPage() {
  const [liked, setLiked] = useState(false);

  return (
    <>
      <PostMain>
        <Flex gap={12}>
          <Avatar src="/kellie-avatar.webp" alt="kellie smith" size="md" />
          <PostHeader userName={'kelliesmith'} createdAt={'1d'} />
        </Flex>
        <PostContent postText="This is a post" postImg="/post-1.webp" />
        <PostActions liked={liked} setLiked={setLiked} />
        <PostStats replies={237} likes={146 + (liked ? 1 : 0)} />
      </PostMain>

      <AddComment />

      <CommentItem
        comment="Looks really good!"
        createdAt="2d"
        likes={100}
        userName="john"
      />
      <CommentItem
        comment="Looks really good!"
        createdAt="7d"
        likes={23}
        userName="Sandro"
        userAvatar="https://i.pravatar.cc/100?u=Sandro"
      />
      <CommentItem
        comment="Looks really good!"
        createdAt="10d"
        likes={45}
        userName="susan"
        userAvatar="https://i.pravatar.cc/100?u=susan"
      />
    </>
  );
}

export default PostPage;
