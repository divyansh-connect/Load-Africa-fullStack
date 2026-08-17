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
    if (response.data?.success && response.data?.data) {
      // Inject mock time tracking data for demo purposes
      response.data.data.arrive_time = new Date(Date.now() - 3600000).toISOString();
      response.data.data.collection_time = new Date(Date.now() - 3000000).toISOString();
      response.data.data.depart_time = new Date(Date.now() - 2400000).toISOString();
      response.data.data.destination_arrive_time = null; // still en-route
    }
    return response.data;
  },
  
  updateTripStatus: async (bookingId, status, remarks = '') => {
    const response = await api.patch(`/driver/status/${bookingId}`, { status, remarks });
    return response.data;
  },
  
  getDriverHistory: async (params) => {
    const response = await api.get('/driver/history', { params });
    if (response.data?.success) {
      // Inject availability history
      response.data.availabilityHistory = [
        { id: 1, status: 'OFFLINE', timestamp: new Date(Date.now() - 86400000).toISOString(), reason: 'Rest break' },
        { id: 2, status: 'OFFLINE', timestamp: new Date(Date.now() - 172800000).toISOString(), reason: 'End of shift' },
        { id: 3, status: 'OFFLINE', timestamp: new Date(Date.now() - 259200000).toISOString(), reason: 'Vehicle maintenance' },
      ];
    }
    return response.data;
  },
  
  getDriverDashboard: async () => {
    const response = await api.get('/driver/dashboard');
    if (response.data?.success && response.data?.data) {
      // Inject mock compliance and performance data
      response.data.data.compliance = {
        uniformAndHygiene: true,
        documentation: true,
      };
      response.data.data.performance = {
        dotScore: 98.5, // Percentage
      };
    }
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

  updateTelemetry: async (bookingId, latitude, longitude, speed = 0, heading = 0) => {
    const response = await api.post(`/driver/trips/${bookingId}/telemetry`, { latitude, longitude, speed, heading });
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
