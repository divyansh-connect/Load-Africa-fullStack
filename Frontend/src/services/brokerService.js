import api from './api';

export const brokerService = {
  getQuoteRequests: async () => {
    const response = await api.get('/broker/quotes/requests');
    return response.data;
  },

  submitQuote: async (bookingId, quoteData) => {
    const response = await api.post(`/broker/quotes/${bookingId}`, quoteData);
    return response.data;
  },

  getAssignedLoads: async () => {
    const response = await api.get('/broker/assigned-loads');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/broker/dashboard');
    return response.data;
  },

  getCommissions: async () => {
    const response = await api.get('/broker/commissions');
    return response.data;
  },

  getCustomers: async () => {
    const response = await api.get('/broker/customers');
    return response.data;
  },

  assignFleet: async (bookingId, fleetOwnerId) => {
    const response = await api.post(`/broker/bookings/${bookingId}/assign-fleet`, { fleetOwnerId });
    return response.data;
  },

  assignDriver: async (bookingId, driverId) => {
    const response = await api.post(`/broker/bookings/${bookingId}/assign-driver`, { driverId });
    return response.data;
  },

  getApprovedFleetOwners: async () => {
    const response = await api.get('/broker/fleet-owners');
    return response.data;
  },

  getApprovedDrivers: async () => {
    const response = await api.get('/broker/drivers');
    return response.data;
  },
};

export default brokerService;
