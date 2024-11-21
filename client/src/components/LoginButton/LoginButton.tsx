import { useNavigate } from 'react-router-dom';

import { Button } from '@mantine/core';

import classes from './LoginButton.module.css';

export function LoginButton() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Button className={classes.login} onClick={handleLogin}>
      Log in
    </Button>
  );
}
