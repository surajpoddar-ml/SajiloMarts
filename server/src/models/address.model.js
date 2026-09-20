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
    phone: {
      type: String,
      required: [true, 'Delivery contact phone number is required'],
      trim: true,
      match: [
        /^(?:\+?(?:977|91)[-\s]?)?[6-9]\d{9}$/,
        'Please provide a valid Nepal (+977) or India (+91) delivery phone number',
      ],
    },
    label: {
      type: String,
      enum: {
        values: ['home', 'work', 'other'],
        message: 'Address label must be one of: home, work, other',
      },
      default: 'home',
      trim: true,
      lowercase: true,
      required: [true, 'Address label is required'],
    },
    country: {
      type: String,
      default: 'Nepal',
      required: [true, 'Country is required'],
      trim: true,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
      minlength: [2, 'Province must be at least 2 characters'],
      maxlength: [50, 'Province cannot exceed 50 characters'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      minlength: [2, 'District must be at least 2 characters'],
      maxlength: [50, 'District cannot exceed 50 characters'],
    },
    municipality: {
      type: String,
      required: [true, 'Municipality / City is required'],
      trim: true,
      minlength: [2, 'Municipality / City must be at least 2 characters'],
      maxlength: [100, 'Municipality / City cannot exceed 100 characters'],
    },
    wardNumber: {
      type: Number,
      required: [true, 'Ward number is required'],
      min: [1, 'Ward number must be at least 1'],
      max: [50, 'Ward number cannot exceed 50'],
      validate: {
        validator: Number.isInteger,
        message: 'Ward number must be an integer',
      },
    },
    tole: {
      type: String,
      required: [true, 'Tole / Locality is required'],
      trim: true,
      minlength: [2, 'Tole / Locality must be at least 2 characters'],
      maxlength: [100, 'Tole / Locality cannot exceed 100 characters'],
    },
    street: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [150, 'Street name cannot exceed 150 characters'],
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
