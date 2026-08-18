import { create } from 'zustand';
import { productAPI } from '../api/products';

const useProductStore = create((set, get) => ({
  products: [],
  currentProduct: null,
  meta: null,
  isLoading: false,
  filters: {
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    orderBy: 'desc',
    category: '',
    search: '',
  },

  fetchProducts: async (params = {}) => {
    set({ isLoading: true });
    try {
      const filters = { ...get().filters, ...params };
      const response = await productAPI.getAll(filters);
      const payload = response.data;
      set({
        products: payload.data || payload.products || payload,
        meta: payload.meta || null,
        filters,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  loadMoreProducts: async () => {
    const { meta, filters, products } = get();
    if (!meta || meta.page >= meta.totalPages) return;

    const nextPage = meta.page + 1;
    set({ isLoading: true });
    try {
      const response = await productAPI.getAll({ ...filters, page: nextPage });
      const payload = response.data;
      set({
        products: [...products, ...(payload.data || payload.products || [])],
        meta: payload.meta,
        filters: { ...filters, page: nextPage },
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await productAPI.getById(id);
      const product = response.data.product || response.data;
      set({ currentProduct: product, isLoading: false });
      return product;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true });
    try {
      const response = await productAPI.create(data);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await productAPI.update(id, data);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      await productAPI.delete(id);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters, page: 1 } });
  },

  resetFilters: () => {
    set({
      filters: {
        page: 1,
        size: 10,
        sortBy: 'createdAt',
        orderBy: 'desc',
        category: '',
        search: '',
      },
    });
  },
}));

export default useProductStore;
