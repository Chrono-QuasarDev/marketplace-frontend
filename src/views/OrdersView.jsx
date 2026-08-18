import React, { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  Package,
  MessageSquarePlus,
  RefreshCw,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const OrdersView = ({ onSelectOrder, onOpenReviewModal, onBrowseMarketplace }) => {
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ordersApi.getOrders();
      if (res && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else if (Array.isArray(res)) {
        setOrders(res);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Failed to load orders:', err.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  const filteredOrders = orders.filter((ord) => {
    if (selectedStatus === 'all') return true;
    return ord.status?.toLowerCase() === selectedStatus.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Purchase Orders & Tracking</h1>
              <p className="text-xs text-slate-400">
                Track status updates and leave verified reviews for delivered purchases
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadOrders}
          disabled={isLoading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((tab) => {
          const isActive = selectedStatus === tab.id;
          const count = tab.id === 'all'
            ? orders.length
            : orders.filter((o) => o.status?.toLowerCase() === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-800 rounded w-1/4" />
              <div className="h-12 bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No orders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {selectedStatus !== 'all'
              ? `You have no orders currently in "${selectedStatus}" status.`
              : "You haven't made any purchases yet."}
          </p>
          <button
            onClick={onBrowseMarketplace}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const product = order.Product || {};
            const isDelivered = order.status === 'delivered';

            return (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition shadow-sm space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} size="sm" />
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Product Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                      <ImageWithFallback
                        src={product.images && product.images[0]}
                        alt={product.title}
                        category={product.category}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        {product.category || 'Item'}
                      </div>
                      <h4 className="text-base font-bold text-white truncate max-w-md">
                        {product.title || 'Marketplace Product'}
                      </h4>
                      <div className="text-xs text-slate-400">
                        Seller: <span className="font-mono text-slate-300">{product.sellerId?.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-[11px] uppercase font-semibold text-slate-400">
                        Price Paid
                      </div>
                      <div className="text-lg font-black text-white">
                        ${Number(order.priceAtPurchase || product.price || 0).toFixed(2)}
                      </div>
                    </div>

                    {isDelivered && (
                      <button
                        onClick={() => onOpenReviewModal(product)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition shrink-0"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
