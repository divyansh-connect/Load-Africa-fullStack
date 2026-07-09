import api from './api';

export const customerService = {
  getDashboard: async () => {
    const response = await api.get('/customers/dashboard');
    return response.data;
  },

  /**
   * Get all bookings where broker has prepared an official quotation.
   * Customer can Accept or Reject each quote here.
   */
  getMyQuotations: async () => {
    const response = await api.get('/customers/my-quotations');
    return response.data;
  },

  /**
   * Customer accepts the broker's quotation.
   * Status transitions: QUOTE_PREPARED → CUSTOMER_ACCEPTED → BOOKING_CONFIRMED
   */
  acceptQuote: async (bookingId) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, {
      status: 'CUSTOMER_ACCEPTED',
      remarks: 'Customer accepted the quotation.',
    });
    return response.data;
  },

  /**
   * Customer rejects the broker's quotation.
   * Status transitions: QUOTE_PREPARED → REJECTED
   */
  rejectQuote: async (bookingId, reason = '') => {
    const response = await api.patch(`/bookings/${bookingId}/status`, {
      status: 'REJECTED',
      remarks: reason || 'Customer rejected the quotation.',
    });
    return response.data;
  },
};
