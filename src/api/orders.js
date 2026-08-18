import axios from './axios';

export const orderAPI = {
  create: (data) => axios.post('/orders/purchase', data),
  getAll: () => axios.get('/orders'),
  getById: (id) => axios.get(`/orders/${id}`),
  updateStatus: (id, data) => axios.patch(`/orders/${id}`, data),
};
