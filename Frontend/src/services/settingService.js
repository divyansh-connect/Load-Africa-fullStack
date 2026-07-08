import api from './api';

export const settingService = {
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Get settings error', error);
      throw error;
    }
  },

  updateSettings: async (settingsMap) => {
    try {
      const response = await api.put('/settings', settingsMap);
      return response.data;
    } catch (error) {
      console.error('Update settings error', error);
      throw error;
    }
  }
};
