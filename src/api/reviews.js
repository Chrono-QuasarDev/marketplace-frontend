import axios from './axios';

export const reviewAPI = {
  create: (data) => axios.post('/reviews', data),
  getByProduct: (productId, params) => axios.get(`/reviews/${productId}`, { params }),
  update: (id, data) => axios.put(`/reviews/${id}`, data),
  delete: (id) => axios.delete(`/reviews/${id}`),
};
