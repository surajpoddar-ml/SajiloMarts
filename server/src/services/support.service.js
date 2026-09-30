import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { SupportConversation } from '../models/supportConversation.model.js';
import { Order } from '../models/order.model.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  assertResourceOwnership,
} from '../utils/index.js';

/**
 * Support Service
 * Manages customer support conversations with ownership-protected CRUD.
 * XSS protection on message content. IDOR prevention on all operations.
 */
export class SupportService extends BaseService {
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Sanitize message content to prevent XSS.
   * Strips HTML tags and dangerous characters.
   * @param {string} content
   * @returns {string}
   */
  sanitizeContent(content) {
    if (!content || typeof content !== 'string') return '';
    return content
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Creates a new support conversation for a customer.
   * @param {string} userId - Customer ID
   * @param {object} data - { subject, message, orderId? }
   * @returns {Promise<object>}
   */
  async createConversation(userId, data = {}) {
    this.validateObjectId(userId, 'User ID');

    const { subject, message, orderId } = data;

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      throw new BadRequestError('Subject must be at least 3 characters');
    }
    if (subject.trim().length > 200) {
      throw new BadRequestError('Subject cannot exceed 200 characters');
    }

    if (!message || typeof message !== 'string' || message.trim().length < 1) {
      throw new BadRequestError('Initial message is required');
    }
    if (message.trim().length > 2000) {
      throw new BadRequestError('Message cannot exceed 2000 characters');
    }

    const sanitizedContent = this.sanitizeContent(message);
    if (!sanitizedContent) {
      throw new BadRequestError('Message content is invalid after sanitization');
    }

    const conversationData = {
      user: userId,
      subject: subject.trim(),
      status: 'open',
      messages: [{
        sender: userId,
        senderRole: 'customer',
        content: sanitizedContent,
      }],
      lastMessageAt: new Date(),
    };

    // Validate order ownership if linking to an order
    if (orderId) {
      this.validateObjectId(orderId, 'Order ID');
      const order = await Order.findById(orderId).lean();
      if (!order) {
        throw new NotFoundError('Linked order not found');
      }
      assertResourceOwnership(order, userId, 'Order', 'user');
      conversationData.order = orderId;
    }

    const conversation = await SupportConversation.create(conversationData);
    return conversation;
  }

  /**
   * Sends a message in an existing conversation.
   * Enforces ownership — customer can only message in their own conversations.
   * @param {string} userId - Authenticated user ID
   * @param {string} userRole - 'customer' or 'admin'
   * @param {string} conversationId - Conversation ObjectId
   * @param {string} content - Message content
   * @returns {Promise<object>}
   */
  async sendMessage(userId, userRole, conversationId, content) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(conversationId, 'Conversation ID');

    if (!content || typeof content !== 'string' || content.trim().length < 1) {
      throw new BadRequestError('Message content is required');
    }
    if (content.trim().length > 2000) {
      throw new BadRequestError('Message cannot exceed 2000 characters');
    }

    const sanitizedContent = this.sanitizeContent(content);
    if (!sanitizedContent) {
      throw new BadRequestError('Message content is invalid after sanitization');
    }

    const conversation = await SupportConversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Customer can only message their own conversations
    if (userRole === 'customer') {
      assertResourceOwnership(conversation, userId, 'Conversation', 'user');
    }

    if (conversation.status === 'closed') {
      throw new BadRequestError('Cannot send messages to a closed conversation');
    }

    conversation.messages.push({
      sender: userId,
      senderRole: userRole,
      content: sanitizedContent,
    });
    conversation.lastMessageAt = new Date();

    await conversation.save();
    return conversation;
  }

  /**
   * Lists conversations for a customer (ownership-protected).
   * @param {string} userId - Customer ID
   * @param {object} options - { status, page, limit }
   * @returns {Promise<object>}
   */
  async listConversations(userId, options = {}) {
    this.validateObjectId(userId, 'User ID');

    const { status, page = 1, limit = 20 } = options;
    const query = { user: userId };

    if (status && ['open', 'closed'].includes(status)) {
      query.status = status;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [conversations, total] = await Promise.all([
      SupportConversation.find(query)
        .select('subject status lastMessageAt createdAt order')
        .populate('order', 'orderNumber productName')
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      SupportConversation.countDocuments(query),
    ]);

    // Add message count and last message preview
    const enriched = conversations.map((conv) => ({
      ...conv,
      messageCount: conv.messages ? conv.messages.length : 0,
    }));

    return {
      conversations: enriched,
      total,
      page: Math.max(1, parseInt(page, 10)),
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Gets a specific conversation with all messages (ownership-protected).
   * @param {string} userId
   * @param {string} conversationId
   * @returns {Promise<object>}
   */
  async getConversation(userId, conversationId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(conversationId, 'Conversation ID');

    const conversation = await SupportConversation.findById(conversationId)
      .populate('order', 'orderNumber productName currentStatus')
      .lean();

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    assertResourceOwnership(conversation, userId, 'Conversation', 'user');

    return conversation;
  }

  /**
   * Closes a conversation. Customer or admin can close.
   * @param {string} userId
   * @param {string} userRole
   * @param {string} conversationId
   * @returns {Promise<object>}
   */
  async closeConversation(userId, userRole, conversationId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(conversationId, 'Conversation ID');

    const conversation = await SupportConversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (userRole === 'customer') {
      assertResourceOwnership(conversation, userId, 'Conversation', 'user');
    }

    conversation.status = 'closed';
    await conversation.save();
    return conversation;
  }
}

export const supportService = new SupportService();
export default supportService;
