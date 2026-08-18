function RatingStars({ value = 0, onChange, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-xl';
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={star <= value ? 'text-yellow-400' : 'text-gray-300'}
          disabled={!onChange}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default RatingStars;
