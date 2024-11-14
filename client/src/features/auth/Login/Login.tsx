import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore.ts';
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

import classes from './Login.module.css';

export function Login() {
  const { setView } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome To Relates!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor
          size="sm"
          component="button"
          onClick={() => setView('signup', navigate)}
        >
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Email" placeholder="email@relates.com" required />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="Remember me" />
          <Anchor
            component="button"
            size="sm"
            onClick={() => setView('forgotpassword', navigate)}
          >
            Forgot password?
          </Anchor>
        </Group>
        <Button fullWidth mt="xl">
          Sign in
        </Button>
      </Paper>
    </Container>
  );
}
