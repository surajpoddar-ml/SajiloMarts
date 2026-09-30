import { BaseController } from './base.controller.js';
import { supportService } from '../services/support.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Support Controller
 * Customer support conversation endpoints.
 */
export class SupportController extends BaseController {
  /**
   * POST /api/v1/support/conversations
   * Creates a new support conversation.
   */
  createConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { subject, message, orderId } = req.body;

    const conversation = await supportService.createConversation(userId, {
      subject,
      message,
      orderId,
    });

    return res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.success(conversation, 'Support conversation created')
    );
  });

  /**
   * POST /api/v1/support/conversations/:conversationId/messages
   * Sends a message in an existing conversation.
   */
  sendMessage = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role || 'customer';
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await supportService.sendMessage(userId, userRole, conversationId, content);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(conversation, 'Message sent')
    );
  });

  /**
   * GET /api/v1/support/conversations
   * Lists conversations for the authenticated customer.
   */
  listConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { status, page, limit } = req.query;

    const result = await supportService.listConversations(userId, { status, page, limit });

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(result, 'Conversations retrieved')
    );
  });

  /**
   * GET /api/v1/support/conversations/:conversationId
   * Gets a specific conversation with all messages.
   */
  getConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { conversationId } = req.params;

    const conversation = await supportService.getConversation(userId, conversationId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(conversation, 'Conversation retrieved')
    );
  });

  /**
   * PATCH /api/v1/support/conversations/:conversationId/close
   * Closes a conversation.
   */
  closeConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role || 'customer';
    const { conversationId } = req.params;

    const conversation = await supportService.closeConversation(userId, userRole, conversationId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(conversation, 'Conversation closed')
    );
  });
}

export const supportController = new SupportController();
export default supportController;
