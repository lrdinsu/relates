import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserUpdateSchema } from 'validation';
import { z } from 'zod';
import { 
  Box, 
  Button, 
  Stack, 
  TextInput, 
  Textarea, 
  Avatar, 
  Flex,
  Text
} from '@mantine/core';
import { useUpdateProfile } from '../../hooks/useUpdateProfile.ts';
import { UserProfile } from '../../hooks/useUserProfile.ts';

type UpdateProfileInput = z.infer<typeof UserUpdateSchema>;

type EditProfileModalProps = {
  user: UserProfile;
  onClose: () => void;
};

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const updateProfileMutation = useUpdateProfile();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      name: user.name,
      biography: user.biography,
      profilePic: user.profilePic,
    },
  });

  const profilePicUrl = watch('profilePic');

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <Flex justify="center">
            <Avatar 
              src={profilePicUrl} 
              size={100} 
              radius={100} 
              name={user.name}
            />
          </Flex>

          <TextInput
            label="Name"
            placeholder="Your display name"
            {...register('name')}
            error={errors.name?.message}
          />

          <TextInput
            label="Avatar URL"
            placeholder="https://example.com/avatar.jpg"
            {...register('profilePic')}
            error={errors.profilePic?.message}
          />

          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            autosize
            minRows={3}
            {...register('biography')}
            error={errors.biography?.message}
          />

          <Button 
            fullWidth 
            type="submit" 
            loading={updateProfileMutation.isPending}
            mt="md"
            radius="xl"
          >
            Save changes
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
