import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, productsApi, ordersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { ShieldCheck, Package, Store, Trash2, RefreshCw, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export const AdminView = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState('orders'); // 'orders' | 'products' | 'users'
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ page: 1, totalItems: 0, totalPages: 1 });
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, oRes, uRes] = await Promise.all([
        productsApi.getProducts({ size: 100 }),
        ordersApi.getOrders(),
        adminApi.getUsers({ page: userPage, size: 10, q: userSearch || undefined }),
      ]);

      setProducts(Array.isArray(pRes?.data) ? pRes.data : Array.isArray(pRes) ? pRes : []);
      setOrders(Array.isArray(oRes?.orders) ? oRes.orders : Array.isArray(oRes) ? oRes : []);
      setUsers(Array.isArray(uRes?.data) ? uRes.data : []);
      setUsersMeta(uRes?.meta || { page: userPage, totalItems: 0, totalPages: 1 });
    } catch (err) {
      console.warn('Failed to load admin data:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userPage, userSearch]);

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

  const handleViewUser = async (targetUser) => {
    try {
      const res = await adminApi.getUserInfo(targetUser.id);
      setSelectedUser(res?.data || null);
    } catch (err) {
      toast.error(err.message || 'Failed to load user details.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Permanently delete user "${targetUser.username}"?`)) return;

    try {
      await adminApi.deleteUser(targetUser.id);
      toast.success(`User ${targetUser.username} deleted.`);
      setUsers((prev) => prev.filter((person) => person.id !== targetUser.id));
      setUsersMeta((prev) => ({ ...prev, totalItems: Math.max(0, prev.totalItems - 1) }));
      if (selectedUser?.id === targetUser.id) setSelectedUser(null);
      if (users.length === 1 && userPage > 1) setUserPage((page) => page - 1);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  const handleUserSearch = (event) => {
    event.preventDefault();
    const query = userSearchInput.trim();
    if (query.length === 1) {
      toast.error('Search requires at least 2 characters.');
      return;
    }
    setUserPage(1);
    setUserSearch(query);
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
          <span>User Access ({usersMeta.totalItems})</span>
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : orders.map((ord) => (
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
        <>
        <form onSubmit={handleUserSearch} className="flex gap-2">
          <input
            type="search"
            value={userSearchInput}
            onChange={(event) => setUserSearchInput(event.target.value)}
            placeholder="Search username or email"
            className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            Search
          </button>
        </form>
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
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
                      <button
                        onClick={() => handleViewUser(person)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-[10px] font-semibold hover:border-slate-500"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDeleteUser(person)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <button
            onClick={() => setUserPage((page) => Math.max(1, page - 1))}
            disabled={userPage <= 1}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-200 disabled:opacity-40"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span>Page {usersMeta.page || userPage} of {usersMeta.totalPages || 1}</span>
          <button
            onClick={() => setUserPage((page) => Math.min(usersMeta.totalPages || 1, page + 1))}
            disabled={userPage >= (usersMeta.totalPages || 1)}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-200 disabled:opacity-40"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {selectedUser && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-white">{selectedUser.username}</h2>
                <p>{selectedUser.email} · {selectedUser.role}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
            <p className="mt-3 font-semibold text-slate-200">Products ({selectedUser.Products?.length || 0})</p>
            {selectedUser.Products?.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-slate-400">
                {selectedUser.Products.map((product) => <li key={product.id}>{product.title}</li>)}
              </ul>
            )}
          </div>
        )}
        </>
      )}
    </div>
  );
};
