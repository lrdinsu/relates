import { useLocation } from 'react-router-dom';
import { actions } from './Actions.ts';
import { NavBarLink } from './NavBarLink.tsx';
import { NotificationNavLink } from './NotificationNavLink.tsx';

export function NavBarLinks({ limit }: { limit?: number }) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/for-you' || location.pathname === '/following';
    }
    return location.pathname.startsWith(path);
  };

  const linksToShow = limit ? actions.slice(0, limit) : actions;

  return linksToShow.map((link) =>
    link.path === '/notifications' ? (
      <NotificationNavLink
        {...link}
        key={link.path}
        active={isActive(link.path)}
        needAuth={link.needAuth}
      />
    ) : (
      <NavBarLink
        {...link}
        key={link.path}
        active={isActive(link.path)}
        needAuth={link.needAuth}
      />
    ),
  );
}
