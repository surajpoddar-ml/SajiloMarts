/**
 * SajiloMarts Frontend API Error Normalizer
 * Provides safe, customer-friendly error objects without exposing internal database or stack traces.
 */

export class ApiClientError extends Error {
  constructor(message, status = 500, errors = null, raw = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
    this.raw = raw;
    this.isAuthError = status === 401;
    this.isForbidden = status === 403;
    this.isNotFound = status === 404;
    this.isRateLimited = status === 429;
  }
}

export const normalizeApiError = (error, status = 500) => {
  if (error instanceof ApiClientError) {
    return error;
  }

  // Network / connection failure
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new ApiClientError(
      'Unable to connect to the server. Please check your internet connection or verify the backend is running.',
      0,
      null,
      error
    );
  }

  const safeMessage = error.message || 'An unexpected error occurred. Please try again.';
  return new ApiClientError(safeMessage, status, error.errors || null, error);
};
