import { modals } from '@mantine/modals';
import { EditProfileModal } from '@/features/user/components/EditProfileModal/EditProfileModal.tsx';
import { UserProfile } from '@/features/user/hooks/useUserProfile.ts';

export function useEditProfileModal() {
  return (user: UserProfile) =>
    modals.open({
      title: 'Edit Profile',
      children: (
        <EditProfileModal
          user={user}
          onClose={() => modals.closeAll()}
        />
      ),
      size: 'md',
      radius: 'md',
      withCloseButton: true,
      styles: {
        title: {
          fontWeight: 700,
        },
      },
    });
}
