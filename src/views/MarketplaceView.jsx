import React, { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  PackageX,
  Sparkles,
  Filter,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Tag,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'home', label: 'Home & Living' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'sports', label: 'Sports & Outdoors' },
  { id: 'books', label: 'Books' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'office', label: 'Office' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'toys', label: 'Toys & Games' },
  { id: 'garden', label: 'Garden' },
  { id: 'vehicles', label: 'Vehicles' },
];

export const MarketplaceView = ({
  onSelectProduct,
  onBuyProduct,
  onEditProduct,
  onOpenCreateModal,
  _onOpenAuthModal,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, totalItems: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters and Query State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'sold'
  const [sortBy, setSortBy] = useState('createdAt');
  const [orderBy, setOrderBy] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productsApi.getProducts({
        page,
        size: pageSize,
        sortBy,
        orderBy,
      });

      if (res && Array.isArray(res.data)) {
        setProducts(res.data);
        if (res.meta) {
          setMeta(res.meta);
        }
      } else if (Array.isArray(res)) {
        setProducts(res);
        setMeta({ page: 1, limit: res.length, totalItems: res.length, totalPages: 1 });
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('Could not fetch products from API:', err.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, orderBy]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Client-side filtering for category & search if needed
  const filteredProducts = products.filter((p) => {
    // Category match
    if (selectedCategory !== 'all' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Availability match
    if (availabilityFilter === 'available' && !p.availability) {
      return false;
    }
    if (availabilityFilter === 'sold' && p.availability) {
      return false;
    }
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCategory = p.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single-Item Marketplace API Integration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Discover, Purchase & Trade Quality Items
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Real-time frontend client connected to the Marketplace REST API. Browse single-item listings, fulfill orders with state transitions, and submit verified customer reviews.
          </p>

          {/* Search bar inside Hero */}
          <div className="pt-2 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by title, category, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 shadow-inner focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {isAuthenticated && user?.role === 'seller' && (
              <button
                onClick={onOpenCreateModal}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient decorative gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-500/10 via-violet-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Tag className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Stock:
            </span>
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                availabilityFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              In Stock
            </button>
            <button
              onClick={() => setAvailabilityFilter('sold')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                availabilityFilter === 'sold'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <XCircle className="w-3 h-3" />
              Sold
            </button>
          </div>
        </div>

        {/* Sort & Pagination size */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={`${sortBy}_${orderBy}`}
              onChange={(e) => {
                const [sb, ob] = e.target.value.split('_');
                setSortBy(sb);
                setOrderBy(ob);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt_desc">Newest Listings</option>
              <option value="createdAt_asc">Oldest Listings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Title: A to Z</option>
              <option value="title_desc">Title: Z to A</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-6 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 space-y-3">
          <PackageX className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No products found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' || availabilityFilter !== 'all'
              ? 'Try changing your search keywords or resetting category filters.'
              : 'There are currently no products listed in the marketplace.'}
          </p>
          {(searchQuery || selectedCategory !== 'all' || availabilityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setAvailabilityFilter('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onBuy={onBuyProduct}
              onEdit={onEditProduct}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs">
          <div className="text-slate-400">
            Showing Page <span className="font-bold text-white">{meta.page}</span> of{' '}
            <span className="font-bold text-white">{meta.totalPages}</span> ({meta.totalItems} total items)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-1 font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-1 font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
