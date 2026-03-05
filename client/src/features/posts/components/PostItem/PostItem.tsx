import { useNavigate } from 'react-router-dom';

import { convertPostTime } from '@/utils/convertPostTime.ts';
import { Divider, Flex } from '@mantine/core';

import { PostActions } from '../PostActions/PostActions.tsx';
import { PostContent } from '../PostContent/PostContent.tsx';
import { PostHeader } from '../PostHeader/PostHeader.tsx';
import { PostLeftBar } from '../PostLeftBar/PostLeftBar.tsx';
import { PostMain } from '../PostMain/PostMain.tsx';
import classes from './PostItem.module.css';
import { Post } from '../../hooks/usePostList.ts';

type postProps = {
  post: Post;
};

export function PostItem({ post }: postProps) {
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
          />
          <PostMain>
            <PostHeader
              userName={post.postedBy.username}
              postTime={convertPostTime(new Date(post.createdAt))}
            />
            <PostContent postText={post.text} postImages={post.images} />
            <PostActions post={post} />
          </PostMain>
        </Flex>
      </div>

      <Divider mx={-16} />
    </>
  );
}
