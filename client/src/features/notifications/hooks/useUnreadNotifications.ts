import { useNotificationSeenStore } from '@/stores/notificationSeenStore.ts';

import { useNotifications } from './useNotifications.ts';

// Derives whether there's anything new since the user last opened the list.
// The list is newest-first, so we only compare the first item's time.
export function useUnreadNotifications() {
  const { data } = useNotifications();
  const lastSeenAt = useNotificationSeenStore((state) => state.lastSeenAt);

  const newest = data?.[0]?.createdAt;
  const hasUnread = newest
    ? new Date(newest).getTime() > lastSeenAt
    : false;

  return { hasUnread };
}
