import { useNavigate } from 'react-router-dom';

import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';

export function useLoginModal() {
  const navigate = useNavigate();

  return () =>
    modals.openConfirmModal({
      title: (
        <Text
          style={{ fontWeight: 700, fontSize: 'x-large', color: '#41a262' }}
        >
          Join relates today!
        </Text>
      ),
      withOverlay: true,
      overlayProps: {
        backgroundOpacity: 0.5,
        blur: 3,
      },
      centered: true,
      yOffset: '35vh',
      translate: 'yes',
      radius: 'lg',
      padding: 'lg',
      transitionProps: { transition: 'fade', duration: 200 },
      withCloseButton: true,
      children: (
        <Text>Log in or sign up to share your thoughts with the world!</Text>
      ),
      labels: { confirm: 'Log in', cancel: 'Sign up' },
      onConfirm: () => navigate('/login'),
      onCancel: () => navigate('/signup'),
    });
}
