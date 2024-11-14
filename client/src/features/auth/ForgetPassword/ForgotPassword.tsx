import {
  Anchor,
  Button,
  Container,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

import classes from './ForgotPassword.module.css';

type ForgotPasswordProps = {
  onBackToLogin: () => void;
};

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const handleResetPassword = () => {
    alert('A password reset link has been sent to your email.');
  };
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Reset Your Password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Back to login page{' '}
        <Anchor size="sm" component="button" onClick={onBackToLogin}>
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput
          label="Email"
          placeholder="Enter your email address"
          required
        />
        <Button fullWidth mt="xl" onClick={handleResetPassword}>
          Reset Password
        </Button>
      </Paper>
    </Container>
  );
}
