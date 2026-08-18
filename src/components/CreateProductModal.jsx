import React, { useState } from 'react';
import { productsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Plus, Trash2, DollarSign, Check } from 'lucide-react';

const POPULAR_CATEGORIES = [
  'electronics',
  'home',
  'fashion',
  'sports',
  'books',
  'beauty',
  'office',
  'grocery',
  'toys',
  'garden',
  'vehicles',
];

const PRESET_SAMPLE_IMAGES = {
  electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
  ],
  home: [
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
  ],
  vehicles: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
  ],
};

export const CreateProductModal = ({ isOpen, onClose, onProductCreated }) => {
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [imageUrls, setImageUrls] = useState([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [availability, setAvailability] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFillSample = (cat) => {
    const samples = PRESET_SAMPLE_IMAGES[cat] || PRESET_SAMPLE_IMAGES.electronics;
    setImageUrls([...samples]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const finalCategory = category === 'other' ? customCategory.trim() : category;

    if (!title.trim()) {
      setErrorMessage('Product title is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Product description is required.');
      return;
    }
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage('Price must be a valid positive number.');
      return;
    }
    if (!finalCategory) {
      setErrorMessage('Category is required.');
      return;
    }
    if (imageUrls.length === 0 || imageUrls.every((url) => !url.trim())) {
      setErrorMessage('At least one valid image URL is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await productsApi.createProduct({
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        category: finalCategory,
        images: imageUrls.filter((u) => u.trim().length > 0),
        availability: Boolean(availability),
      });

      toast.success(`Listing "${created.title}" created successfully!`);
      if (onProductCreated) onProductCreated(created);

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('electronics');
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create product listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Product Listing</h2>
              <p className="text-xs text-slate-400">Add an item to the marketplace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  handleFillSample(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 capitalize"
              >
                {POPULAR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="other">Other / Custom...</option>
              </select>
              {category === 'other' && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Price (USD $) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="99.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe the condition, specifications, and key highlights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Image URLs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Product Image URLs (Array) *
              </label>
              <span className="text-[11px] text-slate-500">
                {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''} attached
              </span>
            </div>

            {/* List of current image URLs */}
            <div className="space-y-2 mb-3">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const updated = [...imageUrls];
                      updated[idx] = e.target.value;
                      setImageUrls(updated);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new image URL */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or paste image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Listing Availability</div>
              <div className="text-[11px] text-slate-400">
                Mark as available for purchase in the public marketplace
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={availability}
                onChange={(e) => setAvailability(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
