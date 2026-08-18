import axios from './axios';

export const authAPI = {
  signup: (data) => axios.post('/auth/signup', data),
  login: (data) => axios.post('/auth/login', data),
  getProfile: () => axios.get('/users/profile'),
  updateProfile: (data) => axios.put('/users/profile', data),
};
