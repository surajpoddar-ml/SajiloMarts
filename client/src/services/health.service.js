import { http } from './http.js';
import { API_ENDPOINTS } from '../constants/index.js';

export const healthService = {
  checkHealth: async () => {
    return http.get(API_ENDPOINTS.HEALTH);
  },
};
