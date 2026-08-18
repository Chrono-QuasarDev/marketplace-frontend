import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Store,
  Package,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown,
  PlusCircle,
  Layers,
} from 'lucide-react';

export const Navbar = ({
  currentView,
  setCurrentView,
  onOpenAuthModal,
  onOpenCreateProductModal,
}) => {
  const { user, isAuthenticated, logout, isBackendConnected, apiUrl } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role || 'guest';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('marketplace')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Marketplace
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-medium text-indigo-400">API Portal</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[10px] ${
                      isBackendConnected
                        ? 'text-emerald-400'
                        : isBackendConnected === false
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                    title={`Connected API: ${apiUrl}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isBackendConnected
                          ? 'bg-emerald-400 animate-pulse'
                          : isBackendConnected === false
                          ? 'bg-rose-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    {isBackendConnected ? 'Online' : isBackendConnected === false ? 'Offline' : 'Connecting'}
                  </span>
                </div>
              </div>
            </button>

            {/* Main Navigation tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('marketplace')}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                  currentView === 'marketplace'
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Explore</span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                    currentView === 'orders'
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </button>
              )}

              {isAuthenticated && (role === 'seller' || role === 'admin') && (
                <button
                  onClick={() => setCurrentView('seller')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                    currentView === 'seller'
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Store className="w-4 h-4 text-indigo-400" />
                  <span>Seller Studio</span>
                </button>
              )}

              {isAuthenticated && role === 'admin' && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                    currentView === 'admin'
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Listing Creator button for sellers */}
            {isAuthenticated && (role === 'seller' || role === 'admin') && (
              <button
                onClick={onOpenCreateProductModal}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Listing</span>
              </button>
            )}

            {/* Profile / Auth controls */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-xs uppercase border border-indigo-500/30">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.username}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 text-sm animate-fade-in divide-y divide-slate-800/80">
                      <div className="px-3 py-2.5">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {user.role}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 truncate">
                            ID: {user.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setCurrentView('profile');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Profile & API Config</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentView('orders');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>Order History</span>
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition font-medium"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('signup')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
