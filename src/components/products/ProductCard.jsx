import { Link } from 'react-router-dom';
import { formatPrice, truncateText } from '../../utils/helpers';

function ProductCard({ product }) {
  const image =
    product.images?.[0] ||
    product.image ||
    'https://placehold.co/400x300/e2e8f0/64748b?text=Product';

  return (
    <Link to={`/products/${product.id}`} className="card overflow-hidden block">
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <img src={image} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-primary-600 mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{truncateText(product.description, 80)}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.availability === false && (
            <span className="text-xs text-red-600 font-medium">Unavailable</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
