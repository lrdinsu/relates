import { Image, Text, SimpleGrid } from '@mantine/core';

type PostContentProps = {
  postImages?: string | string[];
  postText?: string;
};

export function PostContent({ postImages, postText }: PostContentProps) {
  const images = Array.isArray(postImages)
    ? postImages
    : postImages
      ? [postImages]
      : [];

  return (
    <>
      {postText && (
        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
          {postText}
        </Text>
      )}
      {images.length > 0 && (
        <SimpleGrid cols={images.length > 1 ? 2 : 1} spacing="xs" mt="sm">
          {images.map((src, index) => (
            <Image key={index} src={src} w="100%" radius="md" />
          ))}
        </SimpleGrid>
      )}
    </>
  );
}
