import { ENV } from '../config/index.js';
import { APP_CONSTANTS } from '../constants/index.js';
import { ApiClientError, normalizeApiError } from '../utils/apiError.js';

/**
 * SajiloMarts Centralized API Client
 * Supports cookies, auth tokens, automatic timeout aborts, and expired session handling.
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

  const timeoutMs = options.timeout || 4000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${ENV.API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      signal: controller.signal,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sajilomarts:session-expired', {
            detail: { message: data?.message || 'Your session has expired. Please sign in again.' }
          }));
        }
      }

      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      throw new ApiClientError(errorMessage, response.status, data?.errors || null, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiClientError('Server request timed out. Backend may be offline.', 408);
    }
    throw normalizeApiError(error);
  }
};

export default apiClient;
