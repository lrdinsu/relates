import { useState } from 'react';

import { actions } from './Actions.ts';
import { NavBarLink } from './NavBarLink.tsx';

export function NavBarLinks() {
  const [active, setActive] = useState(2);

  return actions.map((link, index) => (
    <NavBarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));
}
