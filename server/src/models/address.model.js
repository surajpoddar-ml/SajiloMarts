import mongoose from 'mongoose';

export const ADDRESS_LABELS = Object.freeze({
  HOME: 'home',
  WORK: 'work',
  OTHER: 'other',
});

export const DEFAULT_COUNTRY = 'Nepal';

export const WARD_BOUNDARIES = Object.freeze({
  MIN: 1,
  MAX: 50,
});

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
      set: (val) => (typeof val === 'string' ? val.trim() : val),
      validate: {
        validator: (val) => typeof val === 'string' && val.trim().length >= 2,
        message: 'Recipient name cannot be empty or whitespace only',
      },
    },
    phone: {
      type: String,
      required: [true, 'Delivery contact phone number is required'],
      trim: true,
      set: (val) => (typeof val === 'string' ? val.trim() : val),
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
      set: (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
      required: [true, 'Address label is required'],
    },
    country: {
      type: String,
      default: 'Nepal',
      required: [true, 'Country is required'],
      trim: true,
      set: (val) => (typeof val === 'string' ? val.trim() : val),
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
    houseBuilding: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [100, 'House/building reference cannot exceed 100 characters'],
    },
    landmark: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [150, 'Landmark cannot exceed 150 characters'],
    },
    postalCode: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters'],
    },
    deliveryInstructions: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [500, 'Delivery instructions cannot exceed 500 characters'],
    },
    isDefaultShipping: {
      type: Boolean,
      default: false,
      required: true,
    },
    isDefaultBilling: {
      type: Boolean,
      default: false,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'addresses',
  }
);

// Compound indexes for optimal lookup patterns
addressSchema.index({ userId: 1, isActive: 1 });
addressSchema.index({ userId: 1, isDefaultShipping: 1 });
addressSchema.index({ userId: 1, isDefaultBilling: 1 });

export const Address = mongoose.model('Address', addressSchema);
export default Address;
