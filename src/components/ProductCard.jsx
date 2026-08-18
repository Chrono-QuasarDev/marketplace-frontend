import React from 'react';
import { ImageWithFallback } from './ImageWithFallback';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, XCircle, Tag, Store, Edit3 } from 'lucide-react';

export const ProductCard = ({ product, onSelect, onBuy, onEdit }) => {
  const { user } = useAuth();

  const isOwner = user && product.sellerId === user.id;
  const isAvailable = Boolean(product.availability);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [''];

  const formattedPrice = typeof product.price === 'number'
    ? product.price.toFixed(2)
    : parseFloat(product.price || 0).toFixed(2);

  return (
    <div className="group flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition duration-300 overflow-hidden">
      {/* Image container */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[4/3] w-full overflow-hidden cursor-pointer bg-slate-950"
      >
        <ImageWithFallback
          src={images[0]}
          alt={product.title}
          category={product.category}
          className="w-full h-full"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-slate-950/80 text-indigo-300 border border-slate-700/60 backdrop-blur-md">
            <Tag className="w-3 h-3 text-indigo-400" />
            {product.category || 'General'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-950/80 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              <XCircle className="w-3 h-3 text-rose-400" />
              Sold
            </span>
          )}
        </div>

        {/* Photo count */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded text-[11px] font-mono bg-black/70 text-slate-300 backdrop-blur-sm">
            +{images.length - 1} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <h3
              onClick={() => onSelect(product)}
              className="text-base font-bold text-white group-hover:text-indigo-400 transition cursor-pointer line-clamp-1"
              title={product.title}
            >
              {product.title}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {product.description || 'No description provided.'}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1 truncate font-mono text-[11px]">
              <Store className="w-3 h-3 text-slate-400" />
              {isOwner ? (
                <span className="text-indigo-400 font-semibold">Your listing</span>
              ) : (
                `Seller: ${product.sellerId ? product.sellerId.slice(0, 8) : 'unknown'}...`
              )}
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-medium">Price</div>
            <div className="text-lg font-black text-white tracking-tight">
              ${formattedPrice}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Edit Product"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                if (isAvailable && !isOwner) {
                  onBuy(product);
                } else {
                  onSelect(product);
                }
              }}
              disabled={!isAvailable && !isOwner}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
                !isAvailable
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : isOwner
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
              }`}
            >
              {!isAvailable ? (
                <span>Sold Out</span>
              ) : isOwner ? (
                <span>View</span>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
