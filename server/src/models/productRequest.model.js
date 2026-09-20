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

const productRequestSchema = new mongoose.Schema(
  {
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
