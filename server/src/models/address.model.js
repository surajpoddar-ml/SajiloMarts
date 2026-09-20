import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Recipient full name is required'],
      trim: true,
      minlength: [2, 'Recipient name must be at least 2 characters'],
      maxlength: [100, 'Recipient name cannot exceed 100 characters'],
      validate: {
        validator: (val) => typeof val === 'string' && val.trim().length >= 2,
        message: 'Recipient name cannot be empty or whitespace only',
      },
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
