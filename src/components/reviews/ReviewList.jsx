import { useEffect, useState } from 'react';
import { reviewAPI } from '../../api/reviews';
import { formatDate } from '../../utils/helpers';
import RatingStars from './RatingStars';

function ReviewList({ productId, refreshKey }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!productId) return;
    reviewAPI
      .getByProduct(productId)
      .then((res) => setReviews(res.data.reviews || res.data.data || res.data || []))
      .catch(() => setReviews([]));
  }, [productId, refreshKey]);

  if (!reviews.length) {
    return <p className="text-gray-500">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{review.user?.username || 'Buyer'}</p>
            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <RatingStars value={review.rating} size="sm" />
          {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}

export default ReviewList;
