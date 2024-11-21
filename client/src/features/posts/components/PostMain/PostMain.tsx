import { Flex } from '@mantine/core';

import styles from './PostMain.module.css';

type PostMainProps = {
  children: React.ReactNode;
  gap?: number;
};

export function PostMain({ children, gap = 8 }: PostMainProps) {
  return (
    <Flex direction="column" gap={gap} className={styles.postMain}>
      {children}
    </Flex>
  );
}
