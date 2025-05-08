import React, { useState } from 'react';
import { Box, IconButton, styled, useTheme } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, FiberManualRecord } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
  images: string[];
  height?: number | string;
  borderRadius?: number;
  showIndicators?: boolean;
  autoPlay?: boolean;
  interval?: number;
}

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: theme.spacing(3),
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 2,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5),
  },
}));

const IndicatorsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(1),
  zIndex: 2,
}));

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  height = 280,
  borderRadius = 3,
  showIndicators = true,
  autoPlay = false,
  interval = 5000
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlay && images.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, interval);
    }
    return () => clearInterval(timer);
  }, [autoPlay, images.length, interval]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <CarouselContainer sx={{ height, borderRadius: theme.spacing(borderRadius) }}>
      {images.length > 1 && (
        <>
          <NavigationButton
            onClick={handlePrev}
            sx={{ left: theme.spacing(1) }}
            size="small"
          >
            <ArrowBackIos fontSize="small" />
          </NavigationButton>
          
          <NavigationButton
            onClick={handleNext}
            sx={{ right: theme.spacing(1) }}
            size="small"
          >
            <ArrowForwardIos fontSize="small" />
          </NavigationButton>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Box
            component="img"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
          />
        </motion.div>
      </AnimatePresence>

      {showIndicators && images.length > 1 && (
        <IndicatorsContainer>
          {images.map((_, index) => (
            <FiberManualRecord
              key={index}
              onClick={() => handleDotClick(index)}
              sx={{
                fontSize: index === currentIndex ? 12 : 8,
                color: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </IndicatorsContainer>
      )}
    </CarouselContainer>
  );
};

export default ImageCarousel; 