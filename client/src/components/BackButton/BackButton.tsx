import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import classes from './BackButton.module.css';

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const isHome = location.pathname === '/' || location.pathname === '/for-you' || location.pathname === '/following';
    setShowButton(!isHome);
  }, [location.pathname]);

  const handleBack = () => {
    if (location.key === 'default') {
      void navigate('/');
    } else {
      void navigate(-1);
    }
  };

  return (
    showButton && (
      <ActionIcon onClick={handleBack} className={classes.backButton}>
        <IconArrowLeft size={20} />
      </ActionIcon>
    )
  );
}
