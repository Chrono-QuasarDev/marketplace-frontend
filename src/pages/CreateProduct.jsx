import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useProductStore from '../stores/productStore';
import ProductForm from '../components/products/ProductForm';

function CreateProduct() {
  const navigate = useNavigate();
  const { createProduct, isLoading } = useProductStore();

  const onSubmit = async (data) => {
    const created = await createProduct(data);
    toast.success('Product created');
    navigate(`/products/${created.id || created.product?.id || ''}`);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Sell a product</h1>
      <ProductForm onSubmit={onSubmit} isLoading={isLoading} submitLabel="Create listing" />
    </div>
  );
}

export default CreateProduct;
