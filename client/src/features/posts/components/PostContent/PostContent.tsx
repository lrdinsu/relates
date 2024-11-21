import { Image, Text } from '@mantine/core';

type PostContentProps = {
  postImg?: string;
  postText: string;
};

export function PostContent({ postImg, postText }: PostContentProps) {
  return (
    <>
      <Text size="sm">{postText}</Text>
      {postImg && <Image src={postImg} w="100%" radius="md" />}
    </>
  );
}
