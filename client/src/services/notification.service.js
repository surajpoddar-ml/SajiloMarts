import { http } from './http.js';

/**
 * SajiloMarts Client Notification Service
 */
export const notificationService = {
  /**
   * Lists notifications for the authenticated user.
   */
  listNotifications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.unreadOnly) query.set('unreadOnly', 'true');
    const qs = query.toString();
    return http.get(`/notifications${qs ? `?${qs}` : ''}`);
  },

  /**
   * Gets unread notification count.
   */
  getUnreadCount: async () => {
    return http.get('/notifications/unread-count');
  },

  /**
   * Marks a specific notification as read.
   */
  markAsRead: async (notificationId) => {
    return http.patch(`/notifications/${notificationId}/read`, {});
  },

  /**
   * Marks all notifications as read.
   */
  markAllAsRead: async () => {
    return http.patch('/notifications/mark-all-read', {});
  },
};

export default notificationService;
