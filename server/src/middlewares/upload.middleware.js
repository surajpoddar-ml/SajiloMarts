import { ApiError } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Secure Payment Proof Upload Middleware
 * Validates MIME types, file sizes, prevents path traversal, and enforces extension whitelist.
 */

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validates file extension against whitelist.
 * @param {string} filename
 * @returns {boolean}
 */
function isAllowedExtension(filename) {
  if (!filename || typeof filename !== 'string') return false;
  const ext = filename.toLowerCase().split('.').pop();
  return ALLOWED_EXTENSIONS.includes(`.${ext}`);
}

/**
 * Detects path traversal attempts in filenames.
 * @param {string} filename
 * @returns {boolean}
 */
function hasPathTraversal(filename) {
  if (!filename || typeof filename !== 'string') return false;
  return filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\') ||
    filename.includes('\0');
}

/**
 * Validates uploaded payment proof payload (base64 image data or file reference).
 * Enhanced with MIME validation, size limits, path traversal protection, and extension whitelist.
 */
export const validatePaymentProofPayload = (req, res, next) => {
  const { paymentProof, paymentProofData, fileType, fileSize, fileName } = req.body || {};

  const proof = paymentProof || paymentProofData || (req.file ? req.file.path : null);
  
  // If no proof image provided, continue (controller and validation will check transaction code)
  if (!proof) {
    return next();
  }

  // Path traversal check on filename
  const uploadedFilename = fileName || (req.file ? req.file.originalname : null);
  if (uploadedFilename && hasPathTraversal(uploadedFilename)) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid filename detected'));
  }

  // Extension whitelist check
  if (uploadedFilename && !isAllowedExtension(uploadedFilename)) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file extension. Only .jpg, .jpeg, .png, and .webp files are permitted'));
  }

  // MIME type validation
  if (fileType && !ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file type. Only JPEG, PNG, and WebP images are permitted'));
  }

  // req.file MIME validation (for multer-based uploads)
  if (req.file && req.file.mimetype && !ALLOWED_MIME_TYPES.includes(req.file.mimetype.toLowerCase())) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid upload file type. Only JPEG, PNG, and WebP images are permitted'));
  }

  // File size validation
  if (fileSize && fileSize > MAX_UPLOAD_SIZE_BYTES) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Payment proof file exceeds maximum 5 MB size limit'));
  }
  if (req.file && req.file.size && req.file.size > MAX_UPLOAD_SIZE_BYTES) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Uploaded file exceeds maximum 5 MB size limit'));
  }

  // Check base64 format if present
  if (typeof proof === 'string' && proof.startsWith('data:')) {
    const mimeMatch = proof.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-.+]+);base64,/);
    if (!mimeMatch || !ALLOWED_MIME_TYPES.includes(mimeMatch[1].toLowerCase())) {
      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Unsupported image format in payment proof. Only JPEG, PNG, and WebP are allowed'));
    }

    // Validate base64 data isn't excessively large
    const base64Data = proof.split(',')[1] || '';
    const estimatedSize = Math.ceil(base64Data.length * 0.75);
    if (estimatedSize > MAX_UPLOAD_SIZE_BYTES) {
      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Payment proof image data exceeds maximum size limit'));
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
  isAllowedExtension,
  hasPathTraversal,
};
