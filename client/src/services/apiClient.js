import { ENV } from '../config/index.js';
import { APP_CONSTANTS } from '../constants/index.js';
import { ApiClientError, normalizeApiError } from '../utils/apiError.js';

/**
 * SastoMarts Centralized API Client
 * Supports cookies, auth tokens, and safe customer-facing error envelopes.
 */
export const apiClient = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN)
    : null;

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${ENV.API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      throw new ApiClientError(errorMessage, response.status, data?.errors || null, data);
    }

    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export default apiClient;
