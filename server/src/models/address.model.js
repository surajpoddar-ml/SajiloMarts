import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  }
);

export const Address = mongoose.model('Address', addressSchema);
export default Address;
