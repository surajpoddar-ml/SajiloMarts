import mongoose from 'mongoose';
import { BadRequestError } from '../utils/badRequestError.js';

export const ALLOWED_SORT_FIELDS = Object.freeze([
  'createdAt',
  'updatedAt',
  'status',
  'productName',
  'quantity',
  'productPriceInr',
]);

export const PAYMENT_MODES = Object.freeze({
  ONLINE_FULL: 'online_100',
  COD_50_50: 'cod_50_50',
});

/**
 * Validates sourcing request creation input.
 * Strictly prevents client-controlled identity, status, or calculated totals.
 */
export const validateCreateProductRequest = (data = {}) => {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new BadRequestError('Request body must be a valid JSON object');
  }

  const {
    productUrl,
    productName,
    quantity,
    variant,
    notes,
    productPriceInr,
    deliveryAddress,
    paymentMode,
  } = data;

  // Product URL validation
  if (!productUrl || typeof productUrl !== 'string' || !productUrl.trim()) {
    errors.push('Product URL is required and must be a non-empty string');
  } else if (productUrl.length > 2000) {
    errors.push('Product URL cannot exceed 2000 characters');
  }

  // Product Name validation
  if (!productName || typeof productName !== 'string' || !productName.trim()) {
    errors.push('Product name is required');
  } else if (productName.trim().length < 2 || productName.trim().length > 200) {
    errors.push('Product name must be between 2 and 200 characters');
  }

  // Quantity validation
  if (quantity !== undefined && quantity !== null) {
    const qtyNum = Number(quantity);
    if (!Number.isInteger(qtyNum) || qtyNum < 1 || qtyNum > 1000) {
      errors.push('Quantity must be an integer between 1 and 1000');
    }
  }

  // Variant validation
  if (variant !== undefined && variant !== null) {
    if (typeof variant !== 'string') {
      errors.push('Variant must be a string');
    } else if (variant.trim().length > 100) {
      errors.push('Variant cannot exceed 100 characters');
    }
  }

  // Notes validation
  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string') {
      errors.push('Notes must be a string');
    } else if (notes.trim().length > 1000) {
      errors.push('Notes cannot exceed 1000 characters');
    }
  }

  // Product price in INR validation
  if (productPriceInr !== undefined && productPriceInr !== null) {
    const priceNum = Number(productPriceInr);
    if (typeof priceNum !== 'number' || !Number.isFinite(priceNum) || priceNum <= 0) {
      errors.push('Product price in INR must be a positive number greater than 0');
    } else if (priceNum > 10000000) {
      errors.push('Product price exceeds maximum allowable threshold');
    }
  }

  // Delivery address format validation
  if (deliveryAddress !== undefined && deliveryAddress !== null && deliveryAddress !== '') {
    if (typeof deliveryAddress !== 'string' || !mongoose.Types.ObjectId.isValid(deliveryAddress)) {
      errors.push('Invalid delivery address ID format');
    }
  }

  // Payment mode validation
  if (paymentMode !== undefined && paymentMode !== null) {
    const normalizedMode = String(paymentMode).toLowerCase();
    const validModes = ['online_100', 'cod_50_50', 'online_full'];
    if (!validModes.includes(normalizedMode)) {
      errors.push("Invalid payment mode. Supported modes are 'ONLINE_FULL' and 'COD_50_50'");
    }
  }

  if (errors.length > 0) {
    throw new BadRequestError(errors.join('. '));
  }

  return true;
};

/**
 * Validates query parameters for request listing.
 */
export const validateListProductRequests = (query = {}) => {
  const page = query.page !== undefined ? parseInt(query.page, 10) : 1;
  const limit = query.limit !== undefined ? parseInt(query.limit, 10) : 10;
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  if (isNaN(page) || page < 1) {
    throw new BadRequestError('Page parameter must be a positive integer starting from 1');
  }

  if (isNaN(limit) || limit < 1 || limit > 50) {
    throw new BadRequestError('Limit parameter must be an integer between 1 and 50');
  }

  if (!ALLOWED_SORT_FIELDS.includes(sortBy)) {
    throw new BadRequestError(
      `Invalid sort field '${sortBy}'. Allowed fields: ${ALLOWED_SORT_FIELDS.join(', ')}`
    );
  }

  return { page, limit, sortBy, sortOrder };
};

/**
 * Validates quote calculation input.
 */
export const validateQuoteCalculationRequest = (data = {}) => {
  const errors = [];
  const { productPriceInr, quantity, paymentMode } = data;

  if (productPriceInr === undefined || productPriceInr === null) {
    errors.push('Product price in INR is required to calculate a quote');
  } else {
    const priceNum = Number(productPriceInr);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      errors.push('Product price in INR must be a valid positive number');
    }
  }

  if (quantity !== undefined && quantity !== null) {
    const qtyNum = Number(quantity);
    if (!Number.isInteger(qtyNum) || qtyNum < 1) {
      errors.push('Quantity must be a positive whole integer');
    }
  }

  if (paymentMode !== undefined && paymentMode !== null) {
    const normalizedMode = String(paymentMode).toLowerCase();
    const validModes = ['online_100', 'cod_50_50', 'online_full'];
    if (!validModes.includes(normalizedMode)) {
      errors.push("Invalid payment mode. Supported modes are 'ONLINE_FULL' and 'COD_50_50'");
    }
  }

  if (errors.length > 0) {
    throw new BadRequestError(errors.join('. '));
  }

  return true;
};
