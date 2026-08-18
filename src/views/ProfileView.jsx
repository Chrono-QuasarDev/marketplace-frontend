import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Server,
  ShoppingBag,
  Store,
} from 'lucide-react';

export const ProfileView = () => {
  const {
    user,
    token,
    apiUrl,
    setApiUrl,
    updateUsername,
    isBackendConnected,
    pingBackend,
    login,
  } = useAuth();
  const { toast } = useToast();

  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const [customApiUrl, setCustomApiUrl] = useState(apiUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setUsernameInput(user.username);
    }
  }, [user]);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      toast.warning('Username cannot be blank.');
      return;
    }
    if (usernameInput.trim() === user?.username) {
      toast.info('No changes made to username.');
      return;
    }

    setIsUpdatingUsername(true);
    try {
      await updateUsername(usernameInput.trim());
      toast.success('Username updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update username.');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiUrl(customApiUrl.trim());
    toast.success('API Base URL updated!');
    pingBackend();
  };

  const handlePing = async () => {
    setIsPinging(true);
    const ok = await pingBackend();
    setIsPinging(false);
    if (ok) {
      toast.success('Backend is online and reachable!');
    } else {
      toast.error('Unable to reach backend at the configured URL.');
    }
  };

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    toast.info('JWT Bearer token copied to clipboard!');
  };

  const handleQuickSwitch = async (email, password) => {
    try {
      await login({ email, password });
      toast.success(`Switched account to ${email}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to switch account.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Account Profile & API Settings</h1>
        <p className="text-xs text-slate-400">
          Manage your user credentials, view token details, and configure the backend connection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: User Profile Card */}
        <div className="md:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 font-black text-xl flex items-center justify-center border border-indigo-500/30">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-white truncate">{user?.username}</h2>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Shield className="w-3 h-3" />
                    Role: {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info fields */}
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">User ID</span>
                <span className="font-mono text-slate-300 select-all">{user?.id || 'N/A'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Registered Email</span>
                <span className="text-slate-300">{user?.email || 'N/A'}</span>
              </div>
            </div>

            {/* Edit Username form */}
            <form onSubmit={handleUpdateUsername} className="pt-3 border-t border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Update Username (PUT /api/users/profile)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingUsername || usernameInput === user?.username}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
                  >
                    {isUpdatingUsername ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Account Switcher */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Quick Account Switcher</h3>
              <p className="text-xs text-slate-400">
                Instantly switch roles to test Buyer, Seller, and Admin flows
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSwitch('buyer1@example.com', 'mypassword123')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition space-y-1"
              >
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>buyer1</span>
                </div>
                <div className="text-[10px] text-slate-500">Buyer account</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSwitch('seller1@example.com', 'mypassword123')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition space-y-1"
              >
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-400" />
                  <span>seller1</span>
                </div>
                <div className="text-[10px] text-slate-500">Seller account</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: API Configuration & Bearer Token */}
        <div className="md:col-span-6 space-y-6">
          {/* API Server Configuration */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Backend API Server</h3>
                  <p className="text-[11px] text-slate-400">REST endpoint target</p>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isBackendConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isBackendConnected === false
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
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
                {isBackendConnected ? 'Connected' : isBackendConnected === false ? 'Offline' : 'Testing'}
              </div>
            </div>

            <form onSubmit={handleSaveApiUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Base API URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    placeholder="/api or http://localhost:3000/api"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiUrl('/api');
                    setApiUrl('/api');
                    toast.info('Reset API URL to default /api proxy');
                  }}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  Reset to default (/api)
                </button>

                <button
                  type="button"
                  onClick={handlePing}
                  disabled={isPinging}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Bearer Token */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Active JWT Bearer Token</h3>
              </div>

              {token && (
                <button
                  onClick={handleCopyToken}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 break-all max-h-36 overflow-y-auto">
              {token ? (
                <span>{token}</span>
              ) : (
                <span className="text-slate-600 italic">No token active. Please sign in.</span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This token is automatically passed as <code className="text-indigo-400 font-mono">Authorization: Bearer &lt;token&gt;</code> on all authenticated API requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
