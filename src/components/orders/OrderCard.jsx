import { Link } from 'react-router-dom';
import { formatDate, formatPrice } from '../../utils/helpers';
import OrderStatusBadge from './OrderStatusBadge';

function OrderCard({ order }) {
  return (
    <Link
      to={`/orders/${order.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm text-gray-500">Order #{order.id}</p>
          <h3 className="font-semibold mt-1">{order.product?.title || 'Product'}</h3>
          <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <OrderStatusBadge status={order.status} />
          <p className="font-bold mt-2">{formatPrice(order.total || order.product?.price || 0)}</p>
        </div>
      </div>
    </Link>
  );
}

export default OrderCard;
