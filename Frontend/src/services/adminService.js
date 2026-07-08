import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUsersByRole: async (params) => {
    const response = await api.get('/admin/users/role', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  getAllBookings: async (params) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  },

  assignProvider: async (id, providerData) => {
    const response = await api.post(`/admin/bookings/${id}/assign`, providerData);
    return response.data;
  },

  getPendingUsers: async () => {
    const response = await api.get('/admin/pending-users');
    return response.data;
  },

  approveUser: async (userId) => {
    const response = await api.post(`/admin/users/approve/${userId}`);
    return response.data;
  },

  rejectUser: async (userId) => {
    const response = await api.post(`/admin/users/reject/${userId}`);
    return response.data;
  },

  approveDriverKYC: async (driverId) => {
    const response = await api.post(`/admin/kyc/approve/${driverId}`);
    return response.data;
  },

  approveFleetOwner: async (fleetId) => {
    const response = await api.post(`/admin/fleet/approve/${fleetId}`);
    return response.data;
  },

  approveVehicle: async (vehicleId) => {
    const response = await api.post(`/admin/vehicle/approve/${vehicleId}`);
    return response.data;
  },

  approvePlantOwner: async (plantId) => {
    const response = await api.post(`/admin/plant/approve/${plantId}`);
    return response.data;
  },

  approveMachine: async (machineId) => {
    const response = await api.post(`/admin/machine/approve/${machineId}`);
    return response.data;
  }
};
