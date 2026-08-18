import { create } from 'zustand';

const useUIStore = create((set) => ({
  isModalOpen: false,
  modalContent: null,
  notification: null,

  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
  setNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
}));

export default useUIStore;
