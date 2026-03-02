import { useNavigate, useParams } from 'react-router-dom';

import { Loading } from '@/components/Loading/Loading.tsx';
import { PostList } from '@/features/posts/components/PostList/PostList.tsx';
import { UserHeader } from '@/features/user/components/UserHeader/UserHeader.tsx';
import { useUserProfile } from '@/features/user/hooks/useUserProfile.ts';

export function UserPage() {
  const navigate = useNavigate();
  const { username, tab } = useParams<{ username: string; tab?: string }>();
  const { data: user, isLoading, isError } = useUserProfile(username);

  const activeTab = tab == 'comments' ? 'comments' : 'posts';

  if (isLoading) {
    return <Loading />;
  }

  if (isError || user == null) {
    return <div>User not found</div>;
  }

  const endPoint =
    activeTab == 'posts'
      ? `/user/${username}/posts`
      : `/user/${username}/comments`;

  return (
    <>
      <UserHeader
        tab={activeTab}
        onTabChange={(tab) => navigate(`/profile/${tab}`)}
        user={user}
      />
      <PostList endpoint={endPoint} />
    </>
  );
}
