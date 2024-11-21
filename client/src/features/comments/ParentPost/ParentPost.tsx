import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { convertPostTime } from '@/utils/convertPostTime.ts';
import { Flex } from '@mantine/core';

import { PostActions } from '../../posts/components/PostActions/PostActions.tsx';
import { PostContent } from '../../posts/components/PostContent/PostContent.tsx';
import { PostHeader } from '../../posts/components/PostHeader/PostHeader.tsx';
import { PostMain } from '../../posts/components/PostMain/PostMain.tsx';

type ParentPostProps = {
  username: string;
  avatar: string | null;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  postText?: string;
  postImages?: string;
  postTime: Date;
};

export function ParenPost({
  username,
  avatar,
  repostsCount,
  likesCount,
  commentsCount,
  postText,
  postImages,
  postTime,
}: ParentPostProps) {
  return (
    <PostMain>
      <Flex gap={12}>
        <UserPic username={username} avatar={avatar} />
        <PostHeader
          userName={username}
          postTime={convertPostTime(new Date(postTime))}
        />
      </Flex>
      <PostContent postText={postText} postImages={postImages} />
      <PostActions
        likesCount={likesCount}
        repostsCount={repostsCount}
        commentsCount={commentsCount}
      />
    </PostMain>
  );
}
