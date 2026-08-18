import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { ImageWithFallback } from './ImageWithFallback';
import {
  X,
  Package,
  CheckCircle2,
  AlertCircle,
  MessageSquarePlus,
  Truck,
} from 'lucide-react';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onOrderStatusUpdated,
  onOpenReviewModal,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!isOpen || !order) return null;

  const role = user?.role || 'buyer';
  const isSeller = user && (order.Product?.sellerId === user.id || role === 'admin');
  const isBuyer = user && order.buyerId === user.id;

  const currentStatus = (order.status || 'pending').toLowerCase();
  const product = order.Product || {};

  // Valid next status options based on backend status transition rules
  const getNextStatusOptions = (status) => {
    switch (status) {
      case 'pending':
        return [
          { value: 'processing', label: 'Mark as Processing' },
          { value: 'cancelled', label: 'Cancel Order' },
        ];
      case 'processing':
        return [
          { value: 'shipped', label: 'Mark as Shipped' },
          { value: 'cancelled', label: 'Cancel Order' },
        ];
      case 'shipped':
        return [
          { value: 'delivered', label: 'Mark as Delivered' },
          { value: 'cancelled', label: 'Cancel Order' },
        ];
      default:
        return [];
    }
  };

  const nextOptions = getNextStatusOptions(currentStatus);

  const handleUpdateStatus = async () => {
    if (!selectedNextStatus) return;

    setIsUpdatingStatus(true);
    try {
      const res = await ordersApi.updateOrderStatus(order.id, selectedNextStatus);
      toast.success(`Order #${order.id.slice(0, 8)} status updated to ${selectedNextStatus}!`);
      if (onOrderStatusUpdated) onOrderStatusUpdated(res.order || { ...order, status: selectedNextStatus });
      setSelectedNextStatus('');
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Order Details</h2>
              <p className="text-xs text-slate-400 font-mono">ID: {order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Status Stepper */}
          {currentStatus !== 'cancelled' ? (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Order Timeline</span>
                <StatusBadge status={currentStatus} size="sm" />
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = STATUS_STEPS.indexOf(currentStatus);
                  const isPassed = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1 capitalize font-medium ${
                          isCurrent
                            ? 'text-indigo-400 font-bold'
                            : isPassed
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <strong className="block font-semibold">Order Cancelled</strong>
                This order was cancelled. Any locked inventory has been restored.
              </div>
            </div>
          )}

          {/* Product Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
              <ImageWithFallback
                src={product.images && product.images[0]}
                alt={product.title}
                category={product.category}
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                {product.category || 'Item'}
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                {product.title || 'Marketplace Item'}
              </h4>
              <div className="text-xs font-bold text-white mt-1">
                Purchase Price: ${Number(order.priceAtPurchase || product.price || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Buyer ID</span>
              <span className="font-mono text-slate-300 truncate block">
                {order.buyerId || 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Seller ID</span>
              <span className="font-mono text-slate-300 truncate block">
                {product.sellerId || 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Order Placed</span>
              <span className="text-slate-300">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-500 block mb-0.5">Last Updated</span>
              <span className="text-slate-300">
                {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Seller / Admin Status Progression Controls */}
          {isSeller && nextOptions.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Seller Fulfillment Action</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transition this order to the next stage in the fulfillment pipeline.
              </p>

              <div className="flex items-center gap-2">
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select next status...</option>
                  {nextOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={!selectedNextStatus || isUpdatingStatus}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {isUpdatingStatus ? 'Updating...' : 'Apply Status'}
                </button>
              </div>
            </div>
          )}

          {/* Buyer Action: Write Review if delivered */}
          {isBuyer && currentStatus === 'delivered' && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-emerald-300">Delivered & Verified!</div>
                <div className="text-[11px] text-slate-400">
                  Share your experience by leaving a review for this product.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenReviewModal) onOpenReviewModal(product);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 transition"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
