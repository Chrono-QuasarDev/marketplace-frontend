import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RatingStars } from './RatingStars';
import { X, Star, Check, AlertCircle } from 'lucide-react';

export const ReviewFormModal = ({
  isOpen,
  onClose,
  product,
  existingReview = null,
  onReviewSubmitted,
}) => {
  const { toast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = Boolean(existingReview);

  useEffect(() => {
    if (existingReview && isOpen) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setErrorMessage('');
  }, [existingReview, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        const updated = await reviewsApi.updateReview(existingReview.id, {
          rating,
          comment: comment.trim(),
        });
        toast.success('Review updated successfully!');
        if (onReviewSubmitted) onReviewSubmitted(updated);
      } else {
        const created = await reviewsApi.createReview({
          productId: product.id,
          rating,
          comment: comment.trim(),
        });
        toast.success('Review submitted successfully!');
        if (onReviewSubmitted) onReviewSubmitted(created);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err.message ||
          'Failed to submit review. Note: You must have a delivered order for this product to review it.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Edit Review' : 'Rate & Review Product'}
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{product.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Star selector */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center justify-center gap-1 py-1">
              <RatingStars
                rating={rating}
                size="xl"
                interactive={true}
                onChange={(r) => setRating(r)}
              />
            </div>
            <div className="text-xs font-bold text-amber-400">
              {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Outstanding!'}
              {rating === 4 && '⭐️⭐️⭐️⭐️ Very Good!'}
              {rating === 3 && '⭐️⭐️⭐️ Average'}
              {rating === 2 && '⭐️⭐️ Below Expectations'}
              {rating === 1 && '⭐️ Poor'}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Review Comment
            </label>
            <textarea
              rows={4}
              placeholder="What did you like or dislike? How was the condition upon delivery?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-[11px] text-slate-400">
            💡 <strong className="text-slate-300">Policy:</strong> Reviews can only be submitted once per product after your purchase has reached <span className="text-emerald-400 font-semibold">Delivered</span> status.
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Update Review' : 'Submit Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
