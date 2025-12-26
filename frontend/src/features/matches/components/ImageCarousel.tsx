import React, { useState, useCallback } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700">
      {/* Image */}
      <img 
        src={images[currentIndex]} 
        alt={`${alt} - ${currentIndex + 1}`} 
        className="h-full w-full object-cover" 
      />

      {/* Indicators (Story style) */}
      <div className="absolute top-4 left-0 right-0 flex w-full px-4 gap-1 z-30">
        {images.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              idx === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Navigation Zones */}
      <div className="absolute inset-0 flex z-20">
        {/* Left Zone (Previous) */}
        <div 
          className="w-1/2 h-full cursor-pointer" 
          onClick={handlePrev}
          role="button"
          aria-label="Previous image"
        />
        
        {/* Right Zone (Next) */}
        <div 
          className="w-1/2 h-full cursor-pointer" 
          onClick={handleNext}
          role="button"
          aria-label="Next image"
        />
      </div>
    </div>
  );
};

export default ImageCarousel;
