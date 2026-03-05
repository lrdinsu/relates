import { useState, useEffect, useCallback } from 'react';
import { Image, Text, SimpleGrid, Portal, UnstyledButton } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import classes from './PostContent.module.css';

type PostContentProps = {
  postImages?: string | string[];
  postText?: string;
};

export function PostContent({ postImages, postText }: PostContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const images = Array.isArray(postImages)
    ? postImages
    : postImages
      ? [postImages]
      : [];

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => 
      prev !== null ? (prev - 1 + images.length) % images.length : null
    );
  }, [images.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) => 
      prev !== null ? (prev + 1) % images.length : null
    );
  }, [images.length]);

  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIndex(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, handlePrev, handleNext, handleClose]);

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
            <Image 
              key={index} 
              src={src} 
              w="100%" 
              radius="md" 
              className={classes.thumbnail}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(index);
              }}
            />
          ))}
        </SimpleGrid>
      )}

      {selectedImageIndex !== null && (
        <Portal>
          <div 
            className={classes.imageOverlay} 
            onClick={handleClose}
          >
            <UnstyledButton 
              className={classes.closeButton} 
              onClick={handleClose}
            >
              <IconX size={24} />
            </UnstyledButton>

            {images.length > 1 && (
              <>
                <UnstyledButton 
                  className={`${classes.navButton} ${classes.prevButton}`} 
                  onClick={handlePrev}
                >
                  <IconChevronLeft size={32} />
                </UnstyledButton>
                <UnstyledButton 
                  className={`${classes.navButton} ${classes.nextButton}`} 
                  onClick={handleNext}
                >
                  <IconChevronRight size={32} />
                </UnstyledButton>
              </>
            )}

            <img 
              src={images[selectedImageIndex]} 
              alt="Full size" 
              className={classes.fullImage}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </Portal>
      )}
    </>
  );
}
