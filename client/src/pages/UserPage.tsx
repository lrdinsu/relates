import { Post } from '@/features/posts/Post/Post.tsx';
import { UserHeader } from '@/features/user/userHeader/UserHeader.tsx';

export function UserPage() {
  return (
    <>
      <UserHeader />
      <Post
        likes={1200}
        replies={481}
        postImg="/post-1.webp"
        postText="Great time with my friends!"
      />
      <Post
        likes={234}
        replies={46}
        postImg="/post-2.webp"
        postText="Working on a new project"
      />
      <Post
        likes={3462}
        replies={1235}
        postImg="/post-3.webp"
        postText="Who like kittens?"
      />
      <Post
        likes={3462}
        replies={1235}
        postText="I just want to say that I love you all!"
      />
    </>
  );
}
