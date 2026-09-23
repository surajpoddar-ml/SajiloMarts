import mongoose from 'mongoose';
import { SECURITY_TOKEN_PURPOSES } from '../constants/auth.constants.js';

const securityTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for security token'],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
      trim: true,
    },
    purpose: {
      type: String,
      enum: {
        values: Object.values(SECURITY_TOKEN_PURPOSES),
        message: '{VALUE} is not a valid security token purpose',
      },
      required: [true, 'Token purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Token expiration time is required'],
    },
    isUsed: {
      type: Boolean,
      default: false,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      ip: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.tokenHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.tokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for token verification lookups
securityTokenSchema.index({ tokenHash: 1, purpose: 1 }, { unique: true });

// Compound index for user-specific active token queries and invalidations
securityTokenSchema.index({ userId: 1, purpose: 1, isUsed: 1 });

// MongoDB TTL Index for automatic background cleanup of expired security tokens
securityTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SecurityToken = mongoose.model('SecurityToken', securityTokenSchema);
export default SecurityToken;
