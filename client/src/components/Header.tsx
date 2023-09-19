import {
  Flex,
  Image,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';

export function Header() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark');
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Flex justify="center" mt={24} mb={48}>
      <UnstyledButton w={24} onClick={toggleColorScheme}>
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
