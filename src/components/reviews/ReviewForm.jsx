import { useState } from 'react';
import { reviewAPI } from '../../api/reviews';
import RatingStars from './RatingStars';
import toast from 'react-hot-toast';

function ReviewForm({ productId, onCreated }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reviewAPI.create({ productId, rating, comment });
      toast.success('Review submitted');
      setComment('');
      onCreated?.();
    } catch {
      /* interceptor toasts */
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold">Write a review</h3>
      <RatingStars value={rating} onChange={setRating} />
      <textarea
        className="input-field"
        rows={3}
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}

export default ReviewForm;
