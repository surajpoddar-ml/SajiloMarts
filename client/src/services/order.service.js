import { http } from './http.js';

export const orderService = {
  /**
   * Retrieves paginated current orders for authenticated customer.
   */
  getCurrentOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http.get(`/orders/current${query ? `?${query}` : ''}`);
  },

  /**
   * Retrieves paginated completed order history for authenticated customer.
   */
  getOrderHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http.get(`/orders/history${query ? `?${query}` : ''}`);
  },

  /**
   * Retrieves detail of an individual order.
   */
  getOrderDetail: async (orderId) => {
    return http.get(`/orders/${orderId}`);
  },
};

export default orderService;
