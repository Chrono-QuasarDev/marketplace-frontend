import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ShoppingBagIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import useProductStore from '../stores/productStore';
import ProductCard from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';

function Home() {
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts({ page: 1, size: 4 });
  }, [fetchProducts]);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure Transactions',
      description: 'Your transactions are safe and secure with our platform.',
    },
    {
      icon: TruckIcon,
      title: 'Fast Delivery',
      description: 'Get your products delivered quickly and efficiently.',
    },
    {
      icon: ShoppingBagIcon,
      title: 'Quality Products',
      description: 'Browse through our curated selection of quality items.',
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-12 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to MarketPlace</h1>
          <p className="text-xl text-primary-100 mb-8">
            Discover amazing products from trusted sellers. Buy and sell with confidence.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Start Shopping
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <div key={feature.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
