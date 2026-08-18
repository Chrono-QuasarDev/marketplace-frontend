import React, { useState, useEffect, useCallback } from 'react';
import { productsApi, ordersApi, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ShieldCheck, Package, Store, Trash2, RefreshCw, Users } from 'lucide-react';

export const AdminView = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState('orders'); // 'orders' | 'products' | 'users'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, oRes, uRes] = await Promise.all([
        productsApi.getProducts({ size: 100 }),
        ordersApi.getOrders(),
        usersApi.getUsers(),
      ]);

      setProducts(Array.isArray(pRes?.data) ? pRes.data : Array.isArray(pRes) ? pRes : []);
      setOrders(Array.isArray(oRes?.orders) ? oRes.orders : Array.isArray(oRes) ? oRes : []);
      setUsers(Array.isArray(uRes?.users) ? uRes.users : Array.isArray(uRes) ? uRes : []);
    } catch (err) {
      console.warn('Failed to load admin data:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleDeleteProduct = async (product) => {
    const confirmDel = window.confirm(`Admin: Permanently delete "${product.title}"?`);
    if (!confirmDel) return;

    try {
      await productsApi.deleteProduct(product.id);
      toast.success('Admin: Product deleted.');
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await ordersApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Admin: Order status changed to ${newStatus}.`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? (res.order || { ...o, status: newStatus }) : o))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to change order status.');
    }
  };

  const handleUpdateUserRole = async (targetUser, nextRole) => {
    if (!targetUser || !nextRole || targetUser.role === nextRole) return;

    const confirmRole = window.confirm(
      `Admin: Change ${targetUser.username}'s role from ${targetUser.role} to ${nextRole}?`
    );
    if (!confirmRole) return;

    try {
      const res = await usersApi.updateUserRole(targetUser.id, nextRole);
      toast.success(`Admin: ${targetUser.username} is now a ${nextRole}.`);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? res.user : u)));
    } catch (err) {
      toast.error(err.message || 'Failed to update user role.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Administrator Console</h1>
              <p className="text-xs text-slate-400">
                System-wide oversight of products, transactions, and moderation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Admin Data</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            System Products
          </span>
          <div className="text-2xl font-black text-white">{products.length}</div>
          <span className="text-[11px] text-slate-500">Total listed in database</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            System Orders
          </span>
          <div className="text-2xl font-black text-purple-400">{orders.length}</div>
          <span className="text-[11px] text-slate-500">Total transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current User Role
          </span>
          <div className="text-2xl font-black text-emerald-400 uppercase">{user?.role}</div>
          <span className="text-[11px] text-slate-500">Root / Moderator permissions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 rounded-2xl p-1.5 gap-2">
        <button
          onClick={() => setTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            tab === 'orders'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>All Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setTab('products')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            tab === 'products'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>All Products ({products.length})</span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            tab === 'users'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Access ({users.length})</span>
        </button>
      </div>

      {/* Orders Table */}
      {tab === 'orders' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Product</th>
                <th className="p-4">Buyer ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4 font-mono text-[11px] text-slate-400">{ord.id.slice(0, 8)}...</td>
                  <td className="p-4 font-bold text-white max-w-xs truncate">{ord.Product?.title || 'Item'}</td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">{ord.buyerId.slice(0, 8)}...</td>
                  <td className="p-4 font-bold text-white">${Number(ord.priceAtPurchase || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <StatusBadge status={ord.status} size="sm" />
                  </td>
                  <td className="p-4 text-slate-400">
                    {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Table */}
      {tab === 'products' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-4">Product ID</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Seller ID</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4 font-mono text-[11px] text-slate-400">{prod.id.slice(0, 8)}...</td>
                  <td className="p-4 font-bold text-white max-w-xs truncate">{prod.title}</td>
                  <td className="p-4 capitalize text-indigo-400">{prod.category}</td>
                  <td className="p-4 font-bold text-white">${Number(prod.price).toFixed(2)}</td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">{prod.sellerId.slice(0, 8)}...</td>
                  <td className="p-4">
                    {prod.availability ? (
                      <span className="text-emerald-400 font-semibold">Available</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Sold</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteProduct(prod)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((person) => (
                <tr key={person.id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-white">{person.username}</div>
                    <div className="font-mono text-[11px] text-slate-400">{person.id.slice(0, 8)}...</div>
                  </td>
                  <td className="p-4 text-slate-300">{person.email}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        person.role === 'admin'
                          ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                          : person.role === 'seller'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-200 border border-slate-600'
                      }`}
                    >
                      {person.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {person.role !== 'buyer' && (
                        <button
                          onClick={() => handleUpdateUserRole(person, 'buyer')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-[10px] font-semibold hover:border-slate-500"
                        >
                          Buyer
                        </button>
                      )}
                      {person.role !== 'seller' && (
                        <button
                          onClick={() => handleUpdateUserRole(person, 'seller')}
                          className="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold hover:bg-emerald-500/20"
                        >
                          Promote to Seller
                        </button>
                      )}
                      {person.role !== 'admin' && (
                        <button
                          onClick={() => handleUpdateUserRole(person, 'admin')}
                          className="px-2.5 py-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-300 text-[10px] font-semibold hover:bg-violet-500/20"
                        >
                          Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
