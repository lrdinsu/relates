import { NavLink, useLocation } from 'react-router-dom';

import { BackButton } from '@/components/BackButton/BackButton.tsx';
import { useAuthStore } from '@/stores/authStore.ts';
import { useTitleStore } from '@/stores/titleStore.ts';
import { Flex, Text } from '@mantine/core';

import classes from './Header.module.css';

export function HeaderDesktop() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const title = useTitleStore((state) => state.title);
  const location = useLocation();

  const isHome = location.pathname === '/' || location.pathname === '/for-you' || location.pathname === '/following';

  return (
    <Flex
      justify="center"
      align="center"
      className={classes.header}
    >
      <div className={classes.backButtonContainer}>
        <BackButton />
      </div>

      {isAuthenticated && isHome ? (
        <div className={classes.tabsContainer}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `${classes.tab} ${isActive ? classes.activeTab : ''}`
            }
          >
            For you
          </NavLink>
          <NavLink 
            to="/following" 
            className={({ isActive }) => 
              `${classes.tab} ${isActive ? classes.activeTab : ''}`
            }
          >
            Following
          </NavLink>
        </div>
      ) : (
        <Text className={classes.homeTitle}>{isHome ? 'Home' : title}</Text>
      )}
    </Flex>
  );
}
