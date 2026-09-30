import { http } from './http.js';

/**
 * SajiloMarts Customer Support Client Service
 */
export const supportService = {
  /**
   * Lists support conversations for the authenticated customer.
   */
  listConversations: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return http.get(`/support/conversations${qs ? `?${qs}` : ''}`);
  },

  /**
   * Creates a new support conversation.
   */
  createConversation: async (data) => {
    return http.post('/support/conversations', data);
  },

  /**
   * Gets a specific conversation with all messages.
   */
  getConversation: async (conversationId) => {
    return http.get(`/support/conversations/${conversationId}`);
  },

  /**
   * Sends a message in a conversation.
   */
  sendMessage: async (conversationId, content) => {
    return http.post(`/support/conversations/${conversationId}/messages`, { content });
  },

  /**
   * Closes a conversation.
   */
  closeConversation: async (conversationId) => {
    return http.patch(`/support/conversations/${conversationId}/close`, {});
  },
};

export default supportService;
