import { apiClient } from './apiClient.js';

export const http = {
  get: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (endpoint, body, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  patch: (endpoint, body, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'DELETE' }),
};
