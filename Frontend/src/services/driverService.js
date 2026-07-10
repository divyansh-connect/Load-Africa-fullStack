import api from './api';

export const driverService = {
  getAvailableLoads: async (params) => {
    const response = await api.get('/driver/available-loads', { params });
    return response.data;
  },
  
  applyForLoad: async (bookingId) => {
    const response = await api.post(`/driver/apply/${bookingId}`);
    return response.data;
  },
  
  getActiveTrip: async () => {
    const response = await api.get('/driver/active-trip');
    return response.data;
  },
  
  updateTripStatus: async (bookingId, status, remarks = '') => {
    const response = await api.patch(`/driver/status/${bookingId}`, { status, remarks });
    return response.data;
  },
  
  getDriverHistory: async (params) => {
    const response = await api.get('/driver/history', { params });
    return response.data;
  },
  
  getDriverDashboard: async () => {
    const response = await api.get('/driver/dashboard');
    return response.data;
  },
  
  submitKYC: async (data) => {
    const response = await api.post('/driver/kyc/submit', data);
    return response.data;
  },

  getKYCDocuments: async () => {
    const response = await api.get('/driver/kyc/documents');
    return response.data;
  },

  uploadKYCDocument: async (docKey, fileUrl) => {
    const response = await api.post('/driver/kyc/upload-document', { docKey, fileUrl });
    return response.data;
  },
  
  getWallet: async () => {
    const response = await api.get('/finance/wallet');
    return response.data;
  },
  
  withdrawEarnings: async (amount) => {
    const response = await api.post('/finance/withdraw', { amount });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/driver/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/driver/profile', data);
    return response.data;
  },

  updateTelemetry: async (bookingId, latitude, longitude) => {
    const response = await api.post(`/driver/trips/${bookingId}/telemetry`, { latitude, longitude });
    return response.data;
  },

  acceptAssignment: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/accept`);
    return response.data;
  },

  rejectAssignment: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/reject`);
    return response.data;
  },

  toggleOnline: async (isOnline, latitude, longitude) => {
    const response = await api.post('/driver/toggle-online', { isOnline, latitude, longitude });
    return response.data;
  }
};
