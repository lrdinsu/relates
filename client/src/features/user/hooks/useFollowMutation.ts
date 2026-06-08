import { axiosInstance } from '@/api/axiosConfig.ts';
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

type FollowableUser = {
  id: number;
  isFollowing: boolean;
  followersCount?: number;
};

type SearchUsersPage = {
  users?: FollowableUser[];
  nextCursor: number | null;
};

function updateFollowableUser<T extends FollowableUser>(
  user: T,
  targetUserId: number,
): T {
  if (user.id !== targetUserId) return user;

  const isFollowing = !user.isFollowing;
  const followersCount =
    user.followersCount == null
      ? user.followersCount
      : user.followersCount + (isFollowing ? 1 : -1);

  return { ...user, isFollowing, followersCount };
}

export function useFollowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await axiosInstance.put<{ message?: string }>(
        `/users/follow/${userId}`,
      );
      return data;
    },
    onSuccess: (_data, userId) => {
      for (const query of queryClient.getQueriesData<FollowableUser>({
        queryKey: ['userProfile'],
      })) {
        const [queryKey, user] = query;
        if (!user) continue;
        queryClient.setQueryData(queryKey, updateFollowableUser(user, userId));
      }

      for (const query of queryClient.getQueriesData<
        InfiniteData<SearchUsersPage>
      >({ queryKey: ['search'] })) {
        const [queryKey, data] = query as [QueryKey, InfiniteData<SearchUsersPage> | undefined];
        if (!data) continue;

        queryClient.setQueryData(queryKey, {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            users: page.users?.map((user) =>
              updateFollowableUser(user, userId),
            ),
          })),
        });
      }

      void queryClient.invalidateQueries({ queryKey: ['parentPost'] });
      void queryClient.invalidateQueries({ queryKey: ['childposts'] });
    },
  });
}
