import React, { useState } from 'react';

const CATEGORY_FALLBACK_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
  office: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
  garden: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
  vehicles: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
};

export const ImageWithFallback = ({ src, alt, category, className = '', ...props }) => {
  const [hasError, setHasError] = useState(false);
  const [isSampleUrl] = useState(() => {
    return typeof src === 'string' && (src.includes('example.com') || src.startsWith('bike-') || src.length < 5);
  });

  const getSource = () => {
    if (hasError || isSampleUrl || !src) {
      if (category && CATEGORY_FALLBACK_IMAGES[category.toLowerCase()]) {
        return CATEGORY_FALLBACK_IMAGES[category.toLowerCase()];
      }
      return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
    }
    return src;
  };

  const finalSrc = getSource();

  return (
    <div className={`relative overflow-hidden bg-slate-800 ${className}`}>
      <img
        src={finalSrc}
        alt={alt || 'Product image'}
        onError={() => setHasError(true)}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        {...props}
      />
    </div>
  );
};
