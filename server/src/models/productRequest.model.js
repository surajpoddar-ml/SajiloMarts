import mongoose from 'mongoose';

export const SUPPORTED_MARKETPLACES = Object.freeze([
  'amazon-india',
  'flipkart',
  'myntra',
  'meesho',
  'nykaa',
  'tata-1mg',
  'ajio',
  'other',
]);

export const PRODUCT_URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

const productRequestSchema = new mongoose.Schema(
  {
    productUrl: {
      type: String,
      required: [true, 'Product URL is required'],
      trim: true,
      maxlength: [2000, 'Product URL cannot exceed 2000 characters'],
      validate: {
        validator: function (url) {
          if (!url || typeof url !== 'string') return false;
          if (!PRODUCT_URL_REGEX.test(url)) return false;
          try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'Product URL must be a valid absolute HTTP or HTTPS URL',
      },
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    marketplace: {
      type: String,
      required: [true, 'Marketplace is required'],
      enum: {
        values: SUPPORTED_MARKETPLACES,
        message: 'Invalid marketplace specified',
      },
      default: 'other',
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'product_requests',
  }
);

export const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);
export default ProductRequest;
