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

  /**
   * Updates an existing delivery address for the authenticated customer.
   */
  async updateAddress(addressId, addressData) {
    return http.put(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`, addressData);
  },

  /**
   * Deactivates/deletes a delivery address.
   */
  async deleteAddress(addressId) {
    return http.delete(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`);
  },

  /**
   * Sets an address as the default shipping address.
   */
  async setDefaultShipping(addressId) {
    return http.patch(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}/default`, {});
  },
};

export default addressService;
