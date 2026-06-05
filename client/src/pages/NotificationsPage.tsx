import { useEffect } from 'react';

import { Loading } from '@/components/Loading/Loading.tsx';
import { NotificationItem } from '@/features/notifications/components/NotificationItem.tsx';
import { useNotifications } from '@/features/notifications/hooks/useNotifications.ts';
import { useNotificationSeenStore } from '@/stores/notificationSeenStore.ts';
import { useTitleStore } from '@/stores/titleStore.ts';
import { Center, Divider, Stack, Text } from '@mantine/core';

export function NotificationsPage() {
  const { data, isPending, isError } = useNotifications();
  const markSeen = useNotificationSeenStore((state) => state.markSeen);
  const setTitle = useTitleStore((state) => state.setTitle);

  // Opening the page clears the unread dot and sets the header title (covers a
  // direct visit by URL, where the nav click wouldn't have set it).
  useEffect(() => {
    setTitle('Notifications');
    markSeen();
  }, [setTitle, markSeen]);

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Center py="xl">
        <Text c="gray.6">Could not load notifications</Text>
      </Center>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Center py="xl">
        <Text c="gray.6">No notifications yet</Text>
      </Center>
    );
  }

  return (
    <Stack gap={0}>
      {data.map((notification, index) => (
        <div key={notification.id}>
          <NotificationItem notification={notification} />
          {index < data.length - 1 && <Divider />}
        </div>
      ))}
    </Stack>
  );
}
