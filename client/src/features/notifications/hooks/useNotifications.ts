import { axiosInstance } from '@/api/axiosConfig.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import { useQuery } from '@tanstack/react-query';

export type NotificationItem = {
  id: number;
  type: 'LIKE' | 'FOLLOW';
  read: boolean;
  createdAt: string;
  actor: { id: number; username: string; profilePic: string | null };
  post: { id: number; text: string | null } | null;
};

type NotificationsResponse = { notifications: NotificationItem[] };

// Fetches the current user's notifications (newest first). Polls on an interval
// so the unread dot and the list stay fresh without websockets. Disabled when
// logged out so we don't fire a 401.
export function useNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationItem[]> => {
      const response =
        await axiosInstance.get<NotificationsResponse>('/notifications');
      return response.data.notifications;
    },
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
}
