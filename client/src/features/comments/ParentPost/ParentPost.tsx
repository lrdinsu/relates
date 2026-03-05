import { Link } from 'react-router-dom';

import { UserPic } from '@/components/UserPic/UserPic.tsx';
import { convertPostTime } from '@/utils/convertPostTime.ts';
import { Flex } from '@mantine/core';

import { PostActions } from '../../posts/components/PostActions/PostActions.tsx';
import { PostContent } from '../../posts/components/PostContent/PostContent.tsx';
import { PostHeader } from '../../posts/components/PostHeader/PostHeader.tsx';
import { PostMain } from '../../posts/components/PostMain/PostMain.tsx';
import { Post } from '../../posts/hooks/usePostList.ts';

type ParentPostProps = {
  post: Post;
};

export function ParenPost({ post }: ParentPostProps) {
  const { postedBy, createdAt, text, images } = post;
  return (
    <PostMain>
      <Flex gap={12}>
        <Link
          to={`/user/${postedBy.username}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <UserPic username={postedBy.username} avatar={postedBy.profilePic} />
        </Link>
        <PostHeader
          userName={postedBy.username}
          postTime={convertPostTime(new Date(createdAt))}
        />
      </Flex>
      <PostContent postText={text} postImages={images} />
      <PostActions post={post} />
    </PostMain>
  );
}
