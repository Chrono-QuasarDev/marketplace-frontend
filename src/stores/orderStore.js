import { create } from 'zustand';
import { orderAPI } from '../api/orders';

const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await orderAPI.getAll();
      set({
        orders: response.data.orders || response.data || [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await orderAPI.getById(id);
      const order = response.data.order || response.data;
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createOrder: async (productId) => {
    set({ isLoading: true });
    try {
      const response = await orderAPI.create({ productId });
      set({ isLoading: false });
      return response.data.order || response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      const response = await orderAPI.updateStatus(id, { status });
      set({ isLoading: false });
      return response.data.order || response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
}));

export default useOrderStore;
