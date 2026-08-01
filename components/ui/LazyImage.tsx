import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getOptimoleUrl } from '../../services/optimoleService';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  title?: string;
}

export const DEFAULT_FALLBACK_IMAGE = 'https://files.catbox.moe/z44d2s.png';

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = 'Foto Pusaka & Media Spiritual Tapak Pamungkas',
  title,
  className = '',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const rawSrc = error || !src ? fallbackSrc : src;
  const currentSrc = getOptimoleUrl(rawSrc);
  const computedTitle = title || alt || 'Tapak Pamungkas - Pemaharan Piranti & Pusaka Nusantara';

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-stone-950">
      {/* Skeleton Shimmer Loading Placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-stone-900 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin"></div>
        </div>
      )}

      {/* Main Image with SEO & Optimole CDN attributes */}
      <img
        src={currentSrc}
        data-opt-src={currentSrc}
        alt={alt}
        title={computedTitle}
        loading="lazy"
        decoding="async"
        itemProp="image"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />

      {/* Fallback Icon Overlay if broken */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/90 text-stone-500 p-2 text-center pointer-events-none">
          <ImageOff className="w-6 h-6 mb-1 text-amber-500/40" />
          <span className="text-[10px] font-mono text-stone-500">Tapak Pamungkas</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
