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
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware: Hashes password if created or modified.
 * Preserves existing hash untouched during profile, email, or role updates.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
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

export const User = mongoose.model('User', userSchema);
export default User;
