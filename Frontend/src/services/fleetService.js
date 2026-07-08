import api from './api';

export const fleetService = {
  getDashboard: async () => {
    const response = await api.get('/fleet/dashboard');
    return response.data;
  },

  submitCompliance: async (data) => {
    const response = await api.post('/fleet/compliance/submit', data);
    return response.data;
  },

  addVehicle: async (data) => {
    const response = await api.post('/fleet/vehicles', data);
    return response.data;
  },

  addDriver: async (data) => {
    const response = await api.post('/fleet/drivers', data);
    return response.data;
  }
};
