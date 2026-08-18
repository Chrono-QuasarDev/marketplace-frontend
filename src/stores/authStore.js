import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          const { user, token } = response.data;
          sessionStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.error };
        }
      },

      signup: async (username, email, password) => {
        set({ isLoading: true });
        try {
          await authAPI.signup({ username, email, password });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.error };
        }
      },

      logout: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      loadUser: async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getProfile();
          set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch {
          sessionStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateProfile: async (username) => {
        try {
          const response = await authAPI.updateProfile({ username });
          set({ user: response.data.user || response.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.error };
        }
      },

      hasRole: (role) => {
        const { user } = get();
        return user && user.role === role;
      },

      isSeller: () => get().hasRole('seller'),
      isBuyer: () => get().hasRole('buyer'),
      isAdmin: () => get().hasRole('admin'),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);

export default useAuthStore;
