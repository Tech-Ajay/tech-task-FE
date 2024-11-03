import { memo } from 'react';
// Import LazyLoadImage component for optimized image loading
import { LazyLoadImage } from 'react-lazy-load-image-component';
// Import blur effect styles for image loading transition
import 'react-lazy-load-image-component/src/effects/blur.css';

// Define props interface for the ImageCache component
interface ImageCacheProps {
  src: string;          // Source URL of the image
  alt: string;          // Alt text for accessibility
  width?: number;       // Optional width of the image
  height?: number;      // Optional height of the image
  className?: string;   // Optional CSS class name
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;  // Optional error handler
}

// Memoized component to prevent unnecessary re-renders
const ImageCache = memo(({ src, alt, width, height, className, onError }: ImageCacheProps) => {

  // Container styles for centering and positioning the image
  const containerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  };

  // Image styles for proper scaling and positioning
  const imageStyle: React.CSSProperties = {
    objectFit: 'contain',    // Maintain aspect ratio while fitting container
    maxWidth: '100%',        // Prevent image from overflowing container
    position: 'relative'
  };

  return (
    <div style={containerStyle}>
      <LazyLoadImage
        className={className}
        src={src}
        alt={alt}
        width={width}
        height={height}
        effect="blur"           // Add blur effect during loading
        threshold={100}         // Start loading when image is 100px from viewport
        placeholderSrc="data:image/jpeg;base64,/9j/4AAQSkZJRg=="  // Tiny base64 placeholder
        onError={onError}
        style={imageStyle}
      />
    </div>
  );
});

export default ImageCache;