import { ApiError } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validates uploaded payment proof payload (base64 image data or file reference).
 */
export const validatePaymentProofPayload = (req, res, next) => {
  const { paymentProof, paymentProofData, fileType, fileSize } = req.body || {};

  const proof = paymentProof || paymentProofData || (req.file ? req.file.path : null);
  
  // If no proof image provided, continue (controller and validation will check transaction code)
  if (!proof) {
    return next();
  }

  if (fileType && !ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file type. Only JPEG, PNG, and WebP images are permitted'));
  }

  if (fileSize && fileSize > MAX_UPLOAD_SIZE_BYTES) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Payment proof file exceeds maximum 5 MB size limit'));
  }

  // Check base64 format if present
  if (typeof proof === 'string' && proof.startsWith('data:')) {
    const mimeMatch = proof.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (!mimeMatch || !ALLOWED_MIME_TYPES.includes(mimeMatch[1].toLowerCase())) {
      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Unsupported image format in payment proof. Only JPEG, PNG, and WebP are allowed'));
    }
  }

  next();
};

/**
 * Middleware wrapper for handling proof file uploads.
 */
export const uploadProof = {
  single: (fieldName = 'paymentProof') => (req, res, next) => {
    validatePaymentProofPayload(req, res, next);
  },
};

export default {
  uploadProof,
  validatePaymentProofPayload,
};
