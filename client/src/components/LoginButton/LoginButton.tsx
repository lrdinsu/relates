import { Button } from '@mantine/core';

import classes from './LoginButton.module.css';

export function LoginButton() {
  return <Button className={classes.login}>Log in</Button>;
}
