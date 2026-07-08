import api from './api';

export const bookingService = {
  getQuoteRecommendations: async (data) => {
    const response = await api.post('/bookings/quote', data);
    return response.data;
  },
  
  createBooking: async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },
  
  getCustomerBookingsHistory: async (params) => {
    const response = await api.get('/bookings/history', { params });
    return response.data;
  },
  
  getBookingDetails: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  updateBookingStatus: async (id, status, remarks = '') => {
    const response = await api.patch(`/bookings/${id}/status`, { status, remarks });
    return response.data;
  },
  
  getBookingTimeline: async (id) => {
    const response = await api.get(`/bookings/${id}/timeline`);
    return response.data;
  }
};
