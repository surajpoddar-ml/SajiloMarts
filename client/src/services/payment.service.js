import { apiClient } from './apiClient.js';
import { http } from './http.js';

export const paymentService = {
  /**
   * Initializes a payment submission for a customer sourcing request.
   */
  initializePayment: async (payload) => {
    return http.post('/payments/initialize', payload);
  },

  /**
   * Submits customer payment proof with transaction reference or receipt image.
   */
  submitPaymentProof: async (paymentId, formDataOrPayload) => {
    if (formDataOrPayload instanceof FormData) {
      return apiClient(`/payments/${paymentId}/proof`, {
        method: 'POST',
        body: formDataOrPayload,
      });
    }
    return http.post(`/payments/${paymentId}/proof`, formDataOrPayload);
  },

  /**
   * Retrieves payment submission details for authenticated customer.
   */
  getPaymentDetails: async (paymentId) => {
    return http.get(`/payments/${paymentId}`);
  },

  /**
   * Retrieves secure payment proof stream / download URL.
   */
  getPaymentProof: async (paymentId) => {
    return apiClient(`/payments/${paymentId}/proof`, {
      method: 'GET',
    });
  },
};

export default paymentService;
