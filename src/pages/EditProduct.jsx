import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useProductStore from '../stores/productStore';
import ProductForm from '../components/products/ProductForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, fetchProductById, updateProduct, isLoading } = useProductStore();

  useEffect(() => {
    fetchProductById(id).catch(() => {});
  }, [id, fetchProductById]);

  if (!currentProduct) return <LoadingSpinner fullPage />;

  const onSubmit = async (data) => {
    await updateProduct(id, data);
    toast.success('Product updated');
    navigate(`/products/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Edit product</h1>
      <ProductForm defaultValues={currentProduct} onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}

export default EditProduct;
