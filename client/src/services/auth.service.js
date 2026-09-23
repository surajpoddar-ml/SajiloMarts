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
   * Verifies an account email with a security token.
   * @param {string} token
   * @returns {Promise<Object>} API response data
   */
  verifyEmail: async (token) => {
    return http.post('/auth/verify-email', { token });
  },

  /**
   * Requests resending an email verification link.
   * @param {string} [email]
   * @returns {Promise<Object>} API response data
   */
  resendVerification: async (email) => {
    return http.post('/auth/resend-verification', email ? { email } : {});
  },

  /**
   * Submits a forgot password request.
   * @param {string} email
   * @returns {Promise<Object>} API response data
   */
  forgotPassword: async (email) => {
    return http.post('/auth/forgot-password', { email });
  },

  /**
   * Resets password using a recovery token.
   * @param {Object} data - { token, password, confirmPassword }
   * @returns {Promise<Object>} API response data
   */
  resetPassword: async (data) => {
    return http.post('/auth/reset-password', data);
  },

  /**
   * Changes password for an authenticated user.
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise<Object>} API response data
   */
  changePassword: async (data) => {
    return http.post('/auth/change-password', data);
  },

  /**
   * Updates customer profile fields (name, phone).
   * @param {Object} data - { name, phone }
   * @returns {Promise<Object>} API response data
   */
  updateProfile: async (data) => {
    return http.patch('/auth/profile', data);
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
