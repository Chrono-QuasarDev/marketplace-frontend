import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productsApi, reviewsApi, ordersApi } from '../services/api';
import { ImageWithFallback } from './ImageWithFallback';
import { RatingStars } from './RatingStars';
import {
  X,
  ShoppingCart,
  Tag,
  Store,
  Calendar,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquarePlus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onProductUpdated,
  onProductDeleted,
  onOrderCreated,
  onOpenEditModal,
  onOpenReviewModal,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Review filters
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [orderBy, setOrderBy] = useState('desc');

  const productId = product?.id;
  const isOwner = user && product && product.sellerId === user.id;
  const isAvailable = Boolean(product?.availability);
  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : [''];

  // Load reviews for this product
  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setIsLoadingReviews(true);
    try {
      const res = await reviewsApi.getProductReviews(productId, {
        rating: ratingFilter || undefined,
        sortBy,
        orderBy,
      });

      if (Array.isArray(res)) {
        setReviews(res);
      } else if (res && Array.isArray(res.data)) {
        setReviews(res.data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.warn('Failed to load reviews:', err.message);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [productId, ratingFilter, sortBy, orderBy]);

  useEffect(() => {
    if (isOpen && productId) {
      setActiveImageIndex(0);
      loadReviews();
    }
  }, [isOpen, productId, loadReviews]);

  if (!isOpen || !product) return null;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to purchase this product.');
      return;
    }

    if (isOwner) {
      toast.warning('You cannot purchase your own product.');
      return;
    }

    if (!isAvailable) {
      toast.warning('This item is no longer available for purchase.');
      return;
    }

    const confirmBuy = window.confirm(
      `Confirm purchase of "${product.title}" for $${Number(product.price).toFixed(2)}?`
    );
    if (!confirmBuy) return;

    setIsPurchasing(true);
    try {
      const res = await ordersApi.purchase(product.id);
      toast.success('Order placed successfully! Product status updated to Sold.');
      if (onOrderCreated) onOrderCreated(res.order);
      if (onProductUpdated) onProductUpdated({ ...product, availability: false });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to complete purchase.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDeleteProduct = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${product.title}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await productsApi.deleteProduct(product.id);
      toast.success('Product deleted successfully.');
      if (onProductDeleted) onProductDeleted(product.id);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmDel = window.confirm('Delete this review?');
    if (!confirmDel) return;

    try {
      await reviewsApi.deleteReview(reviewId);
      toast.success('Review deleted successfully.');
      loadReviews();
    } catch (err) {
      toast.error(err.message || 'Failed to delete review.');
    }
  };

  // Review statistics calculation
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Tag className="w-3.5 h-3.5" />
              {product.category || 'General'}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              ID: {product.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Top Section: Gallery & Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Gallery Column */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                <ImageWithFallback
                  src={images[activeImageIndex] || images[0]}
                  alt={product.title}
                  category={product.category}
                  className="w-full h-full"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        activeImageIndex === index
                          ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`Thumb ${index + 1}`}
                        category={product.category}
                        className="w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Information Column */}
            <div className="md:col-span-6 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl font-black text-white leading-tight">
                    {product.title}
                  </h1>
                </div>

                {/* Rating snippet */}
                <div className="flex items-center gap-2.5">
                  <RatingStars rating={Number(averageRating)} size="md" />
                  <span className="text-sm font-bold text-amber-400">
                    {averageRating > 0 ? averageRating : 'New'}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                {/* Price block */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                      Listing Price
                    </span>
                    <div className="text-3xl font-black text-white">
                      ${Number(product.price || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                      Availability
                    </span>
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Product Description
                  </h3>
                  <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                    {product.description || 'No detailed description available.'}
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">
                      Seller: <span className="font-mono text-slate-300">{product.sellerId?.slice(0, 8)}...</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                {isOwner ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenEditModal) onOpenEditModal(product);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition"
                    >
                      <Edit2 className="w-4 h-4 text-indigo-400" />
                      <span>Edit Listing</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      disabled={isDeleting}
                      className="py-3 px-4 rounded-xl font-semibold text-xs bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handlePurchase}
                    disabled={!isAvailable || isPurchasing}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-lg ${
                      isAvailable
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60 shadow-none'
                    }`}
                  >
                    {isPurchasing ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : !isAvailable ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Item Unavailable (Purchased)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Purchase Now — ${Number(product.price).toFixed(2)}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Reviews */}
          <div className="pt-8 border-t border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Customer Reviews</span>
                  <span className="text-sm font-normal text-slate-400">
                    ({reviews.length})
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified feedback from customers with delivered orders
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.warning('Please sign in to leave a review.');
                      return;
                    }
                    if (onOpenReviewModal) {
                      onOpenReviewModal(product);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Write Review</span>
                </button>
              </div>
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
              {/* Rating Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                <button
                  onClick={() => setRatingFilter('')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    ratingFilter === ''
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatingFilter(String(r))}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition ${
                      ratingFilter === String(r)
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{r}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort:</span>
                <select
                  value={`${sortBy}_${orderBy}`}
                  onChange={(e) => {
                    const [sb, ob] = e.target.value.split('_');
                    setSortBy(sb);
                    setOrderBy(ob);
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="rating_desc">Highest Rating</option>
                  <option value="rating_asc">Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            {isLoadingReviews ? (
              <div className="py-12 text-center">
                <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-400">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-10 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30">
                <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No reviews yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Buyers who have purchased this item and received delivery can leave a verified review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const isReviewOwner = user && rev.userId === user.id;
                  const isAdmin = user && user.role === 'admin';

                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                            {rev.User?.username ? rev.User.username.slice(0, 2) : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">
                                {rev.User?.username || 'Verified Buyer'}
                              </span>
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                                Verified Purchase
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString()
                                : ''}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <RatingStars rating={rev.rating} size="sm" />
                          {(isReviewOwner || isAdmin) && (
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-300 pl-10 leading-relaxed">
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
