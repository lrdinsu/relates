import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

type ShowNotificationsProps = { title: string; message: string };

export function showNotificationSuccess({
  title,
  message,
}: ShowNotificationsProps) {
  notifications.show({
    title,
    message,
    color: 'green',
    icon: <IconCheck />,
  });
}

export function showNotificationError({
  title,
  message,
}: ShowNotificationsProps) {
  notifications.show({
    title,
    message,
    color: 'red',
    icon: <IconX />,
  });
}
