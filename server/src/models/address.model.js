import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  }
);

export const Address = mongoose.model('Address', addressSchema);
export default Address;
