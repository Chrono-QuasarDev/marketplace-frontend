import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useOrderStore from '../stores/orderStore';
import useAuthStore from '../stores/authStore';
import { formatDate, formatPrice } from '../utils/helpers';
import { ORDER_STATUSES } from '../utils/constants';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

function OrderDetail() {
  const { id } = useParams();
  const { currentOrder, fetchOrderById, updateOrderStatus, isLoading } = useOrderStore();
  const { isSeller } = useAuthStore();

  useEffect(() => {
    fetchOrderById(id).catch(() => {});
  }, [id, fetchOrderById]);

  if (isLoading || !currentOrder) return <LoadingSpinner fullPage />;

  const handleStatus = async (e) => {
    await updateOrderStatus(id, e.target.value);
    toast.success('Status updated');
    fetchOrderById(id);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Order #{currentOrder.id}</p>
          <h1 className="text-2xl font-bold">{currentOrder.product?.title || 'Order'}</h1>
        </div>
        <OrderStatusBadge status={currentOrder.status} />
      </div>
      <p className="text-gray-600">{formatDate(currentOrder.createdAt)}</p>
      <p className="text-xl font-semibold">
        {formatPrice(currentOrder.total || currentOrder.product?.price || 0)}
      </p>
      {isSeller() && (
        <div>
          <label className="block text-sm font-medium mb-1">Update status</label>
          <select className="input-field" value={currentOrder.status} onChange={handleStatus}>
            {Object.values(ORDER_STATUSES).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
