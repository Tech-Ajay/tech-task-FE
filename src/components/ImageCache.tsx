import { useEffect, useState } from 'react';
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

const ImageCache = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  onError 
}: ImageCacheProps) => {
  const [imageSrc, setImageSrc] = useState<string>(src);

  useEffect(() => {
    // Check memory cache first (faster than localStorage)
    if (ImageCache.memoryCache.has(src)) {
      setImageSrc(ImageCache.memoryCache.get(src)!);
      return;
    }

    // Then check localStorage
    const cachedImage = localStorage.getItem(`img_${src}`);
    if (cachedImage) {
      setImageSrc(cachedImage);
      ImageCache.memoryCache.set(src, cachedImage);
      return;
    }

    // If not cached, fetch and cache the image
    fetch(src)
      .then(response => response.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        
        // Store in both memory and localStorage
        ImageCache.memoryCache.set(src, objectUrl);
        localStorage.setItem(`img_${src}`, objectUrl);
        
        setImageSrc(objectUrl);
      })
      .catch(error => {
        console.error('Error caching image:', error);
      });
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
}

// Static memory cache
ImageCache.memoryCache = new Map<string, string>();

export default ImageCache;