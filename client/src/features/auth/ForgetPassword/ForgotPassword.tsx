import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ResetPasswordSchema } from '@/types/schemas.ts';
import { ResetPasswordType } from '@/types/types.ts';
import { showNotificationSuccess } from '@/utils/showNotifications.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { Anchor, Button, Paper, Text, TextInput, Title } from '@mantine/core';

import classes from './ForgotPassword.module.css';

export function ForgotPassword() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = () => {
    showNotificationSuccess({
      title: 'reset password',
      message: 'A password reset link has been sent to your email.',
    });
  };
  return (
    <>
      <Title ta="center" className={classes.title}>
        Reset Your Password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Back to login page{' '}
        <Anchor size="sm" component="button" onClick={() => navigate('/login')}>
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Email"
            placeholder="Enter your email address"
            {...register('email')}
            error={errors.email?.message}
          />
          <Button fullWidth mt="xl" type="submit">
            Reset Password
          </Button>
        </form>
      </Paper>
    </>
  );
}
