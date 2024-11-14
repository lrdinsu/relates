import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

import classes from './Signup.module.css';

type SignupProps = {
  onSwitchPage: () => void;
};

export function Signup({ onSwitchPage }: SignupProps) {
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Create Your Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor size="sm" component="button" onClick={onSwitchPage}>
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Username" placeholder="your username" required />
        <TextInput label="Name" placeholder="your name" required mt="md" />
        <TextInput
          label="Email"
          placeholder="email@relates.com"
          required
          mt="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          mt="md"
        />
        <Button fullWidth mt="xl">
          Sign up
        </Button>
      </Paper>
    </Container>
  );
}
