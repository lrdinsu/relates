import { ActionIcon } from '@mantine/core';
import { useHover } from '@mantine/hooks';

type PostActionProps = {
  children: React.ReactNode;
  color: string;
  onClick: () => void;
};
export function PostAction({ children, color, onClick }: PostActionProps) {
  const { hovered, ref } = useHover();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    onClick();
  }

  return (
    <div ref={ref}>
      <ActionIcon
        onClick={handleClick}
        radius={100}
        p={4}
        w={32}
        h={32}
        variant="subtle"
        color={hovered ? color : 'gray.7'}
      >
        {children}
      </ActionIcon>
    </div>
  );
}
