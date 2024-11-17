import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { LoginSchema, LoginType } from 'validation';

import { FormError } from '@/components/FormError/FormError.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

import { useLoginMutation } from '../../hooks/useLoginMutation.ts';
import classes from './Login.module.css';

export function Login() {
  const navigate = useNavigate();
  const mutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginType) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Title ta="center" className={classes.title}>
        Welcome To Relates!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor
          size="sm"
          component="button"
          onClick={() => navigate('/signup')}
        >
          Create account
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
              label="Email"
              placeholder="email@relates.com"
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
            <Group justify="space-between" mt="lg">
              <Checkbox label="Remember me" />
              <Anchor
                component="button"
                type="button"
                size="sm"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </Anchor>
            </Group>
            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={mutation.isPending}
            >
              Sign in
            </Button>
          </form>
        </Paper>
      </Box>
    </>
  );
}
