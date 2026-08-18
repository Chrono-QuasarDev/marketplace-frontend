import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../utils/validators';
import { CATEGORIES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';

function ProductForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      category: '',
      availability: true,
      ...defaultValues,
      images: Array.isArray(defaultValues?.images)
        ? defaultValues.images.join(', ')
        : defaultValues?.images || '',
    },
  });

  const submit = (data) => {
    const images = data.images
      ? String(data.images)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    onSubmit({ ...data, images });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input className="input-field" {...register('title')} />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea className="input-field" rows={4} {...register('description')} />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input type="number" step="0.01" className="input-field" {...register('price')} />
          {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select className="input-field" {...register('category')}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URLs (comma separated)
        </label>
        <input className="input-field" {...register('images')} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register('availability')} />
        Available for purchase
      </label>
      <button type="submit" disabled={isLoading} className="btn-primary">
        {isLoading ? <LoadingSpinner size="sm" /> : submitLabel}
      </button>
    </form>
  );
}

export default ProductForm;
