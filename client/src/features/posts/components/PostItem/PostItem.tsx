import { useNavigate } from 'react-router-dom';

import { convertPostTime } from '@/utils/convertPostTime.ts';
import { Divider, Flex } from '@mantine/core';

import { Post } from '../../hooks/usePostList.ts';
import { PostActions } from '../PostActions/PostActions.tsx';
import { PostContent } from '../PostContent/PostContent.tsx';
import { PostHeader } from '../PostHeader/PostHeader.tsx';
import { PostLeftBar } from '../PostLeftBar/PostLeftBar.tsx';
import { PostMain } from '../PostMain/PostMain.tsx';
import classes from './PostItem.module.css';

type PostProps = {
  post: Post;
  withLine?: boolean;
  hideDivider?: boolean;
};

export function PostItem({ post, withLine, hideDivider }: PostProps) {
  const navigate = useNavigate();

  return (
    <>
      <div
        onClick={() => navigate(`/posts/${post.id}`)}
        className={classes.postItem}
      >
        <Flex gap={12}>
          <PostLeftBar
            username={post.postedBy.username}
            avatar={post.postedBy.profilePic}
            withLine={withLine}
          />
          <PostMain>
            <PostHeader
              post={post}
              userName={post.postedBy.username}
              name={post.postedBy.name}
              postTime={convertPostTime(new Date(post.createdAt))}
              replyTo={post.parentPost?.postedBy.username}
            />
            <PostContent postText={post.text} postImages={post.images} />
            <PostActions post={post} />
          </PostMain>
        </Flex>
      </div>

      {!hideDivider && <Divider mx={-16} />}
    </>
  );
}
