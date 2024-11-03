import { useEffect, useState, memo } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface ImageCacheProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// Create a global WeakMap outside the component
const memoryCache = new WeakMap<object, string>();

const ImageCache = memo(({ src, alt, width, height, className, onError }: ImageCacheProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src);

  useEffect(() => {
    const controller = new AbortController();
    
    const loadImage = async () => {
      const srcKey = { url: src }; // Create an object key for WeakMap
      if (memoryCache.has(srcKey)) {
        setImageSrc(memoryCache.get(srcKey)!);
        return;
      }

      try {
        const response = await fetch(src, { signal: controller.signal });
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        memoryCache.set(srcKey, objectUrl);
        
        if (blob.size < 5 * 1024 * 1024) {
          localStorage.setItem(`img_${src}`, objectUrl);
        }
        
        setImageSrc(objectUrl);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error caching image:', error);
      }
    };

    loadImage();

    return () => {
      controller.abort();
    };
  }, [src]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  };

  const imageStyle: React.CSSProperties = {
    objectFit: 'contain',
    maxWidth: '100%',
    position: 'relative'
  };

  return (
    <div style={containerStyle}>
      <LazyLoadImage
        className={className}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        effect="blur"
        threshold={100}
        placeholderSrc="data:image/jpeg;base64,/9j/4AAQSkZJRg=="
        onError={onError}
        style={imageStyle}
      />
    </div>
  );
});

export default ImageCache;