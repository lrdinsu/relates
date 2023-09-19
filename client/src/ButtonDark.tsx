import {
  Button,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';

export function ButtonDark() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button onClick={toggleColorScheme}>
      {computedColorScheme === 'dark' ? '☀️' : '🌙'}
    </Button>
  );

  // return (
  //   <Group>
  //     <Button onClick={() => setColorScheme('light')}>Light</Button>
  //     <Button onClick={() => setColorScheme('dark')}>Dark</Button>
  //     <Button onClick={() => setColorScheme('auto')}>Auto</Button>
  //   </Group>
  // );
}
