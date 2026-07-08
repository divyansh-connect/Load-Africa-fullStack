import api from './api';

export const customerService = {
  getDashboard: async () => {
    const response = await api.get('/customers/dashboard');
    return response.data;
  },
};
