import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useProductStore from '../stores/productStore';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import { ProductListSkeleton } from '../components/common/Skeleton';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Products() {
  const [searchParams] = useSearchParams();
  const { products, meta, isLoading, fetchProducts, loadMoreProducts, setFilters } =
    useProductStore();
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const page = parseInt(searchParams.get('page'), 10) || 1;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const orderBy = searchParams.get('orderBy') || 'desc';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    setFilters({ page, sortBy, orderBy, category, search });
    fetchProducts({ page, sortBy, orderBy, category, search });
  }, [searchParams, setFilters, fetchProducts]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMoreProducts();
    setLoadingMore(false);
  };

  const hasMore = meta && meta.page < meta.totalPages;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <span className="text-gray-600">{meta?.totalItems || products.length} products</span>
      </div>

      <ProductFilters />

      {isLoading && !loadingMore ? (
        <ProductListSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={handleLoadMore} disabled={loadingMore} className="btn-secondary px-6 py-2">
                {loadingMore ? <LoadingSpinner size="sm" /> : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
