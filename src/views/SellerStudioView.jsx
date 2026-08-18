import React, { useState, useEffect, useCallback } from 'react';
import { productsApi, ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  Store,
  PlusCircle,
  Package,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Truck,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SellerStudioView = ({
  onOpenCreateModal,
  onOpenEditModal,
  _onSelectOrder,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState('listings'); // 'listings' | 'fulfillment'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadSellerData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const pRes = await productsApi.getProducts({ size: 100 });
      const allProducts = Array.isArray(pRes?.data) ? pRes.data : Array.isArray(pRes) ? pRes : [];
      // Filter for products belonging to current seller
      const sellerProducts = user?.role === 'admin'
        ? allProducts
        : allProducts.filter((p) => p.sellerId === user?.id);
      setProducts(sellerProducts);

      // Fetch orders
      const oRes = await ordersApi.getOrders();
      const allOrders = Array.isArray(oRes?.orders) ? oRes.orders : Array.isArray(oRes) ? oRes : [];
      // Filter orders where Product.sellerId matches current user or admin
      const incomingOrders = user?.role === 'admin'
        ? allOrders
        : allOrders.filter((o) => o.Product?.sellerId === user?.id);
      setOrders(incomingOrders);
    } catch (err) {
      console.warn('Failed to load seller studio data:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  const handleToggleAvailability = async (product) => {
    const nextVal = !product.availability;
    try {
      await productsApi.updateProduct(product.id, {
        availability: nextVal,
      });
      toast.success(
        `Product marked as ${nextVal ? 'Available' : 'Unavailable'}.`
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, availability: nextVal } : p))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update availability.');
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmDel = window.confirm(`Permanently delete "${product.title}"?`);
    if (!confirmDel) return;

    try {
      await productsApi.deleteProduct(product.id);
      toast.success('Product listing deleted successfully.');
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing.');
    }
  };

  const handleAdvanceStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await ordersApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order updated to ${newStatus}!`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? (res.order || { ...o, status: newStatus }) : o))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to advance order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Metrics
  const totalListings = products.length;
  const activeListings = products.filter((p) => p.availability).length;
  const soldListings = totalListings - activeListings;
  const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Seller Studio & Fulfillment</h1>
              <p className="text-xs text-slate-400">
                Manage your product catalog, prices, stock availability, and fulfill customer orders
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSellerData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Listing</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Listings
          </span>
          <div className="text-2xl font-black text-white">{totalListings}</div>
          <span className="text-[11px] text-slate-500">In your catalog</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active in Stock
          </span>
          <div className="text-2xl font-black text-emerald-400">{activeListings}</div>
          <span className="text-[11px] text-slate-500">Available to buy</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sold Items
          </span>
          <div className="text-2xl font-black text-indigo-400">{soldListings}</div>
          <span className="text-[11px] text-slate-500">Orders placed</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Catalog Value
          </span>
          <div className="text-2xl font-black text-white">${totalValue.toFixed(2)}</div>
          <span className="text-[11px] text-slate-500">Total pricing</span>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 rounded-2xl p-1.5 gap-2">
        <button
          onClick={() => setTab('listings')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            tab === 'listings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Product Listings ({products.length})</span>
        </button>

        <button
          onClick={() => setTab('fulfillment')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            tab === 'fulfillment'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Order Fulfillment Pipeline ({orders.length})</span>
        </button>
      </div>

      {/* Tab 1: Product Listings Table */}
      {tab === 'listings' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading listings...</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 space-y-3">
              <Store className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No products listed yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first listing to start selling in the marketplace.
              </p>
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                + Create Listing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((prod) => {
                    const isAvail = Boolean(prod.availability);
                    const images = Array.isArray(prod.images) ? prod.images : [];

                    return (
                      <tr key={prod.id} className="hover:bg-slate-850/40 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                              <ImageWithFallback
                                src={images[0]}
                                alt={prod.title}
                                category={prod.category}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate max-w-xs">
                                {prod.title}
                              </div>
                              <div className="font-mono text-[10px] text-slate-500 truncate">
                                ID: {prod.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="capitalize font-semibold text-indigo-400">
                            {prod.category}
                          </span>
                        </td>

                        <td className="p-4 font-bold text-white text-sm">
                          ${Number(prod.price || 0).toFixed(2)}
                        </td>

                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(prod)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                              isAvail
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            }`}
                            title="Click to toggle availability"
                          >
                            {isAvail ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>In Stock</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Sold Out</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-4 text-slate-400">
                          {prod.createdAt ? new Date(prod.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onOpenEditModal(prod)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
                              title="Edit Listing"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Order Fulfillment Board */}
      {tab === 'fulfillment' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 space-y-3">
              <Truck className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No incoming orders yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When buyers purchase your listed items, orders will appear here for fulfillment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const prod = ord.Product || {};
                const st = (ord.status || 'pending').toLowerCase();
                const isUpdating = updatingOrderId === ord.id;

                return (
                  <div
                    key={ord.id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-2 font-mono text-slate-300">
                        <Package className="w-4 h-4 text-indigo-400" />
                        <span>Order ID: {ord.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={ord.status} size="sm" />
                        <span className="text-slate-500">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          <ImageWithFallback
                            src={prod.images && prod.images[0]}
                            alt={prod.title}
                            category={prod.category}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate max-w-md">
                            {prod.title || 'Product Item'}
                          </h4>
                          <div className="text-xs text-slate-400">
                            Buyer ID: <span className="font-mono text-slate-300">{ord.buyerId?.slice(0, 8)}...</span>
                          </div>
                          <div className="text-xs font-bold text-emerald-400">
                            Purchased at: ${Number(ord.priceAtPurchase || prod.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* State Transition Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                        {st === 'pending' && (
                          <>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleAdvanceStatus(ord.id, 'processing')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <span>Start Processing</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleAdvanceStatus(ord.id, 'cancelled')}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {st === 'processing' && (
                          <>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleAdvanceStatus(ord.id, 'shipped')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Mark as Shipped</span>
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleAdvanceStatus(ord.id, 'cancelled')}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {st === 'shipped' && (
                          <>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleAdvanceStatus(ord.id, 'delivered')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark as Delivered</span>
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleAdvanceStatus(ord.id, 'cancelled')}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 transition disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {st === 'delivered' && (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed & Delivered
                          </span>
                        )}

                        {st === 'cancelled' && (
                          <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            Order Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
