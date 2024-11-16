import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { signupUser } from '@/api/authApi.ts';
import { FormError } from '@/components/FormError.tsx';
import { SignupSchema } from '@/types/schemas.ts';
import { SignupType } from '@/types/types.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Anchor,
  Box,
  Button,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMutation } from '@tanstack/react-query';

import classes from './Signup.module.css';

export function Signup() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupType>({
    resolver: zodResolver(SignupSchema),
  });

  const mutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      navigate('/');
    },
  });

  const onSubmit = (data: SignupType) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Title ta="center" className={classes.title}>
        Create Your Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor size="sm" component="button" onClick={() => navigate('/login')}>
          Sign in
        </Anchor>
      </Text>

      <Box pos="relative">
        <LoadingOverlay
          visible={mutation.isPending}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={handleSubmit(onSubmit)}>
            {mutation.isError && <FormError error={mutation.error} />}
            <TextInput
              label="Username"
              placeholder="your username"
              {...register('username')}
              error={errors.username?.message}
            />
            <TextInput
              label="Email"
              placeholder="email@relates.com"
              mt="md"
              {...register('email')}
              error={errors.email?.message}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              mt="md"
              {...register('password')}
              error={errors.password?.message}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              mt="md"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            <Button
              type="submit"
              fullWidth
              mt="xl"
              loading={mutation.isPending}
            >
              Sign up
            </Button>
          </form>
        </Paper>
      </Box>
    </>
  );
}
