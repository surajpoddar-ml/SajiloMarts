import mongoose from 'mongoose';

const productRequestSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'product_requests',
  }
);

export const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);
export default ProductRequest;
