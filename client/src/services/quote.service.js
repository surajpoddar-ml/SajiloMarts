import { apiClient } from './apiClient.js';

export const quoteService = {
  /**
   * Calculates live authoritative quote from the backend without client math.
   */
  calculateQuote: async (payload) => {
    return apiClient('/quotes/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default quoteService;
