import { apiClient } from './apiClient.js';

export const productRequestService = {
  /**
   * Creates a new sourcing request.
   */
  createRequest: async (payload) => {
    return apiClient('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Retrieves paginated sourcing requests for the authenticated customer.
   */
  getUserRequests: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/requests${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * Retrieves single sourcing request by ID.
   */
  getRequestById: async (requestId) => {
    return apiClient(`/requests/${requestId}`, {
      method: 'GET',
    });
  },

  /**
   * Generates or recalculates quote for a sourcing request.
   */
  generateQuote: async (requestId, payload = {}) => {
    return apiClient(`/requests/${requestId}/quote`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Confirms an authoritative quote.
   */
  confirmQuote: async (requestId) => {
    return apiClient(`/requests/${requestId}/confirm`, {
      method: 'POST',
    });
  },

  /**
   * Cancels a sourcing request.
   */
  cancelRequest: async (requestId) => {
    return apiClient(`/requests/${requestId}/cancel`, {
      method: 'POST',
    });
  },
};

export default productRequestService;
