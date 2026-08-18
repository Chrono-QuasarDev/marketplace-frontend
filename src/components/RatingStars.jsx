import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  max = 5,
  size = 'md',
  interactive = false,
  onChange = () => {},
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = rating >= starNumber;
        const isHalf = !isFilled && rating >= starNumber - 0.5;

        return (
          <button
            key={starNumber}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange(starNumber)}
            className={`transition-colors ${
              interactive
                ? 'cursor-pointer hover:scale-110 focus:outline-none'
                : 'cursor-default pointer-events-none'
            }`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
