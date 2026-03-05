import { useLocation } from 'react-router-dom';
import { actions } from './Actions.ts';
import { NavBarLink } from './NavBarLink.tsx';

export function NavBarLinks() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/for-you' || location.pathname === '/following';
    }
    return location.pathname.startsWith(path);
  };

  return actions.map((link) => (
    <NavBarLink
      {...link}
      key={link.path}
      active={isActive(link.path)}
      onClick={() => {}}
      needAuth={link.needAuth}
    />
  ));
}
