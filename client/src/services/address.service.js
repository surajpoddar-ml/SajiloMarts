import { http } from './http.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

export const addressService = {
  /**
   * Retrieves all verified delivery addresses for the authenticated customer.
   */
  async getAddresses() {
    return http.get(API_ENDPOINTS.USER.ADDRESSES);
  },

  /**
   * Saves a new delivery address for the authenticated customer.
   */
  async addAddress(addressData) {
    return http.post(API_ENDPOINTS.USER.ADDRESSES, addressData);
  },
};

export default addressService;
