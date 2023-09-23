import {
  showNotificationError,
  showNotificationSuccess,
} from '@/utils/showNotifications.tsx';
import { Box, Menu } from '@mantine/core';
import {
  IconBan,
  IconDotsCircleHorizontal,
  IconLink,
  IconMessage2,
} from '@tabler/icons-react';

import styles from '../userHeader/UserHeader.module.css';

export function UseMoreMenu() {
  async function copyURL() {
    const currentURL = window.location.href;
    try {
      await navigator.clipboard.writeText(currentURL);
      showNotificationSuccess({
        title: 'Link copied',
        message: 'Link copied to clipboard',
      });
    } catch (error) {
      showNotificationError({ title: 'Error', message: 'Copy failed' });
    }
  }

  return (
    <Menu>
      <Menu.Target>
        <Box className={styles.iconContainer}>
          <IconDotsCircleHorizontal size={24} cursor="pointer" />
        </Box>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconLink size={14} />} onClick={copyURL}>
          Copy link
        </Menu.Item>
        <Menu.Item leftSection={<IconMessage2 size={14} />}>Messages</Menu.Item>
        <Menu.Item c="red.5" leftSection={<IconBan size={14} />}>
          Block
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
