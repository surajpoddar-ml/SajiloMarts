const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates selected payment proof image file.
 * Returns { isValid: boolean, error: string | null }.
 */
export const validatePaymentProofFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      error: 'Please attach a payment proof receipt screenshot.',
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, or WebP images are supported.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds maximum limit of 5MB.',
    };
  }

  if (file.size <= 0) {
    return {
      isValid: false,
      error: 'The selected file appears to be empty.',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export default {
  validatePaymentProofFile,
};
