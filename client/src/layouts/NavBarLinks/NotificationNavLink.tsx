import { useUnreadNotifications } from '@/features/notifications/hooks/useUnreadNotifications.ts';
import { Indicator } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

import { NavBarLink } from './NavBarLink.tsx';

type NotificationNavLinkProps = {
  icon: typeof IconHome;
  path: string;
  active?: boolean;
  needAuth?: boolean;
};

// The bell, with a small dot when there's something unread. Reuses NavBarLink
// for the click/navigation behavior and just adds the indicator on top.
export function NotificationNavLink(props: NotificationNavLinkProps) {
  const { hasUnread } = useUnreadNotifications();

  return (
    <Indicator color="red" size={10} offset={6} disabled={!hasUnread}>
      <NavBarLink {...props} />
    </Indicator>
  );
}
