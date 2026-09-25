const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates selected payment proof image file.
 * Returns null if valid, or error message string.
 */
export const validatePaymentProofFile = (file) => {
  if (!file) {
    return 'Please attach a payment proof receipt screenshot.';
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Only JPEG, PNG, and WebP images are supported.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds maximum limit of 5 MB.';
  }

  if (file.size <= 0) {
    return 'The selected file appears to be empty.';
  }

  return null;
};
