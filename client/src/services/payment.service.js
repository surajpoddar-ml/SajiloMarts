import { apiClient } from './apiClient.js';

export const paymentService = {
  /**
   * Submits customer payment proof and transaction reference for manual admin verification.
   */
  submitPaymentProof: async (payload) => {
    return apiClient('/payments/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Uploads secure payment receipt / proof file.
   */
  uploadProofFile: async (formData) => {
    return apiClient('/payments/upload-proof', {
      method: 'POST',
      body: formData,
      // apiClient handles multipart/form-data when body is FormData
    });
  },

  /**
   * Retrieves payment submission details for a specific sourcing request.
   */
  getPaymentStatus: async (requestId) => {
    return apiClient(`/payments/request/${requestId}`, {
      method: 'GET',
    });
  },
};

export default paymentService;
