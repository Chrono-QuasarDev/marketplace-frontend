import axios from './axios';

export const productAPI = {
  getAll: (params) => axios.get('/products', { params }),
  getById: (id) => axios.get(`/products/${id}`),
  create: (data) => axios.post('/products', data),
  update: (id, data) => axios.put(`/products/${id}`, data),
  delete: (id) => axios.delete(`/products/${id}`),
};
