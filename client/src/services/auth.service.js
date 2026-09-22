import { http } from './http.js';

export const authService = {
  /**
   * Registers a new customer account.
   * @param {Object} data - { name, email, password, phone }
   * @returns {Promise<Object>} API response data
   */
  register: async (data) => {
    return http.post('/auth/register', data);
  },

  /**
   * Logs in customer or admin.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} API response data
   */
  login: async (credentials) => {
    return http.post('/auth/login', credentials);
  },

  /**
   * Retrieves the currently authenticated user's safe profile.
   * @returns {Promise<Object>} API response data
   */
  getMe: async () => {
    return http.get('/auth/me');
  },

  /**
   * Logs out the user and clears authentication cookie.
   * @returns {Promise<Object>} API response data
   */
  logout: async () => {
    return http.post('/auth/logout', {});
  },
};

export default authService;
