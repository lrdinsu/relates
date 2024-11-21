import {
  IconHeart,
  IconHome,
  IconPlus,
  IconSearch,
  IconUser,
} from '@tabler/icons-react';

export const actions = [
  { icon: IconHome, path: '/', needAuth: false },
  { icon: IconSearch, path: '/search', needAuth: false },
  { icon: IconPlus, path: '/create', needAuth: true },
  { icon: IconHeart, path: '/liked', needAuth: true },
  { icon: IconUser, path: '/profile', needAuth: true },
];
