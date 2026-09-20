import crypto from 'node:crypto';
import path from 'node:path';

export const ALLOWED_IMAGE_MIMES = Object.freeze([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates file upload metadata for payment proof images.
 * @param {object} file - Uploaded file metadata
 * @param {string} file.mimetype - MIME type
 * @param {number} file.size - Size in bytes
 * @param {string} file.originalname - Original filename
 * @returns {{ isValid: boolean, error?: string, safeFilename?: string }}
 */
export const validatePaymentProofUpload = (file) => {
  if (!file) {
    return { isValid: false, error: 'No payment proof file provided' };
  }

  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Payment proof file exceeds maximum allowed size of 5MB',
    };
  }

  const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
  const safeRandomId = crypto.randomBytes(16).toString('hex');
  const safeFilename = `proof_${Date.now()}_${safeRandomId}${ext}`;

  return {
    isValid: true,
    safeFilename,
  };
};

export default {
  ALLOWED_IMAGE_MIMES,
  MAX_FILE_SIZE_BYTES,
  validatePaymentProofUpload,
};
