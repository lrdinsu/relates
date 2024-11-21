import { Image, Text } from '@mantine/core';

type PostContentProps = {
  postImages?: string;
  postText?: string;
};

export function PostContent({ postImages, postText }: PostContentProps) {
  return (
    <>
      {postText && <Text size="sm">{postText}</Text>}
      {postImages && <Image src={postImages} w="100%" radius="md" />}
    </>
  );
}
