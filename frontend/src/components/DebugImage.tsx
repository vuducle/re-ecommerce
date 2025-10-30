'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface DebugImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  unoptimized?: boolean;
}

export default function DebugImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  unoptimized = false,
}: DebugImageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError('Failed to load image');
    setLoading(false);
    console.error('Image loading failed:', src);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  // Log image details for debugging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DebugImage:', {
        src,
        alt,
        unoptimized,
        width,
        height,
      });
    }
  }, [src, alt, unoptimized, width, height]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <p className="text-red-500 text-sm">Image failed to load</p>
          <p className="text-xs text-gray-500 mt-1 break-all">
            {src}
          </p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{ width, height }}
        >
          <p className="text-gray-500">Loading...</p>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized={unoptimized}
        onError={handleError}
        onLoad={handleLoad}
        className={loading ? 'opacity-0' : 'opacity-100'}
      />
    </div>
  );
}
