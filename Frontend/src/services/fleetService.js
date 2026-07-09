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

  // ── Vehicle APIs ──────────────────────────────
  getVehicles: async () => {
    const response = await api.get('/fleet/vehicles');
    return response.data;
  },

  addVehicle: async (data) => {
    const response = await api.post('/fleet/vehicles', data);
    return response.data;
  },

  updateVehicle: async (id, data) => {
    const response = await api.put(`/fleet/vehicles/${id}`, data);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/fleet/vehicles/${id}`);
    return response.data;
  },

  // ── Driver APIs ───────────────────────────────
  getDrivers: async () => {
    const response = await api.get('/fleet/drivers');
    return response.data;
  },

  addDriver: async (data) => {
    const response = await api.post('/fleet/drivers', data);
    return response.data;
  },

  updateDriverStatus: async (id, status) => {
    const response = await api.put(`/fleet/drivers/${id}/status`, { status });
    return response.data;
  },

  deleteDriver: async (id) => {
    const response = await api.delete(`/fleet/drivers/${id}`);
    return response.data;
  },

  updateDriver: async (id, data) => {
    const response = await api.put(`/fleet/drivers/${id}`, data);
    return response.data;
  },

  // ── Plant Applications APIs ────────────────────
  submitPlantApplication: async (data) => {
    const response = await api.post('/plant/applications', data);
    return response.data;
  },

  getPlantApplications: async (status) => {
    const response = await api.get('/plant/applications' + (status ? `?status=${status}` : ''));
    return response.data;
  },

  approvePlantApplication: async (id) => {
    const response = await api.put(`/plant/applications/${id}/approve`);
    return response.data;
  },

  rejectPlantApplication: async (id, reason) => {
    const response = await api.put(`/plant/applications/${id}/reject`, { reason });
    return response.data;
  },

  requestPlantChanges: async (id, reason) => {
    const response = await api.put(`/plant/applications/${id}/changes-requested`, { reason });
    return response.data;
  },

  // ── Upload helper ─────────────────────────────
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('files', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
