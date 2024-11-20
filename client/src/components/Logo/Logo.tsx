import { useNavigate } from 'react-router-dom';

import {
  Flex,
  Image,
  UnstyledButton,
  rem,
  useComputedColorScheme,
} from '@mantine/core';

export function Logo() {
  const navigate = useNavigate();
  const computedColorScheme = useComputedColorScheme('dark');

  return (
    <Flex justify="center">
      <UnstyledButton w={rem(30)} onClick={() => navigate('/')}>
        <Image
          src={
            computedColorScheme === 'dark'
              ? '/logo-dark.svg'
              : '/logo-light.svg'
          }
          alt="logo"
        />
      </UnstyledButton>
    </Flex>
  );
}
