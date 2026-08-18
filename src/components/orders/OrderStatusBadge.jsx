import { ORDER_STATUS_COLORS } from '../../utils/constants';

function OrderStatusBadge({ status }) {
  const color = ORDER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
      {status}
    </span>
  );
}

export default OrderStatusBadge;
