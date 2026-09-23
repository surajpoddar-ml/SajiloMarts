import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;
const BCRYPT_SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      validate: {
        validator: function (v) {
          return typeof v === 'string' && v.trim().length >= 2;
        },
        message: 'Name cannot be empty or whitespace only',
      },
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      set: (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
      validate: {
        validator: function (v) {
          return EMAIL_REGEX.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined || v === '') return true;
          return PHONE_REGEX.test(v.replace(/[\s-]/g, ''));
        },
        message: 'Please provide a valid phone number (Nepal / India mobile format)',
      },
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: '{VALUE} is not a supported account role',
      },
      default: USER_ROLES.CUSTOMER,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Pre-save middleware: Hashes password if created or modified, and updates passwordChangedAt.
 * Preserves existing hash untouched during profile, email, or role updates.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Post-save middleware: Intercepts MongoDB E11000 duplicate key error and formats a safe message.
 */
userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'email';
    const duplicateError = new Error(`An account with this ${field} already exists`);
    duplicateError.name = 'DuplicateKeyError';
    duplicateError.statusCode = 409;
    duplicateError.field = field;
    return next(duplicateError);
  }
  next(error);
});

/**
 * Compares candidate plaintext password with stored bcrypt hash.
 * @param {string} candidatePassword - Plaintext password to test
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Static helper: Formats raw Mongoose validation errors into clean key-message mappings.
 * @param {Error} error - Mongoose validation error
 * @returns {Array<{field: string, message: string}>}
 */
userSchema.statics.formatValidationError = function (error) {
  if (!error || error.name !== 'ValidationError') {
    return [{ field: 'general', message: error ? error.message : 'Unknown validation failure' }];
  }
  return Object.keys(error.errors || {}).map((key) => ({
    field: key,
    message: error.errors[key].message,
  }));
};

export const User = mongoose.model('User', userSchema);
export default User;
