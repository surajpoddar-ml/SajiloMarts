import mongoose from 'mongoose';

/**
 * SajiloMarts Customer Support Conversation Model
 * Stores customer support conversations with embedded messages.
 * Each conversation can optionally be linked to a specific order.
 */

const supportMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message sender is required'],
    },
    senderRole: {
      type: String,
      enum: ['customer', 'admin'],
      required: [true, 'Sender role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      minlength: [1, 'Message cannot be empty'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true,
  }
);

const supportConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      immutable: [true, 'Conversation ownership cannot be reassigned'],
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      required: true,
      index: true,
    },
    messages: [supportMessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'support_conversations',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for efficient user+status queries
supportConversationSchema.index({ user: 1, status: 1 });
supportConversationSchema.index({ user: 1, lastMessageAt: -1 });

export const SupportConversation = mongoose.model('SupportConversation', supportConversationSchema);
export default SupportConversation;
