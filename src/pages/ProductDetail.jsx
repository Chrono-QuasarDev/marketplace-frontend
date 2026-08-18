import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useProductStore from '../stores/productStore';
import useOrderStore from '../stores/orderStore';
import useAuthStore from '../stores/authStore';
import { formatPrice } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, isLoading, fetchProductById, deleteProduct } = useProductStore();
  const { createOrder } = useOrderStore();
  const { isAuthenticated, user, isSeller } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchProductById(id).catch(() => {});
  }, [id, fetchProductById]);

  if (isLoading || !currentProduct) {
    return <LoadingSpinner fullPage />;
  }

  const canEdit = isSeller() && user?.id === currentProduct.sellerId;
  const image =
    currentProduct.images?.[0] ||
    currentProduct.image ||
    'https://placehold.co/800x500/e2e8f0/64748b?text=Product';

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const order = await createOrder(currentProduct.id);
      toast.success('Order placed');
      navigate(`/orders/${order.id}`);
    } catch {
      /* toast via interceptor */
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    toast.success('Product deleted');
    navigate('/products');
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <img src={image} alt={currentProduct.title} className="w-full rounded-xl object-cover" />
        <div>
          <p className="text-sm uppercase text-primary-600">{currentProduct.category}</p>
          <h1 className="text-3xl font-bold mt-1">{currentProduct.title}</h1>
          <p className="text-2xl font-semibold mt-4">{formatPrice(currentProduct.price)}</p>
          <p className="text-gray-600 mt-4">{currentProduct.description}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={handleBuy} className="btn-primary" disabled={currentProduct.availability === false}>
              Buy now
            </button>
            {canEdit && (
              <>
                <Link to={`/products/${id}/edit`} className="btn-secondary">
                  Edit
                </Link>
                <button onClick={handleDelete} className="btn-danger">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        {isAuthenticated && <div className="mb-6"><ReviewForm productId={id} onCreated={() => setRefreshKey((k) => k + 1)} /></div>}
        <ReviewList productId={id} refreshKey={refreshKey} />
      </section>
    </div>
  );
}

export default ProductDetail;
