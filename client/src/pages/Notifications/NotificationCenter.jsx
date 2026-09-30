import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notification.service.js';
import { Card, CardBody, Button, Typography } from '../../components/common';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

const NOTIFICATION_ICONS = {
  order_created: '📋',
  status_changed: '🔄',
  payment_submitted: '💳',
  payment_verified: '✅',
  payment_rejected: '❌',
  support_message: '💬',
  system: '🔔',
};

/**
 * SajiloMarts Notification Center
 * Lists all customer notifications with read/unread state, mark-all-read, and navigation.
 */
export const NotificationCenter = ({ onNavigate = () => {} }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadNotifications = useCallback(async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await notificationService.listNotifications({ page: p, limit: 20 });
      const data = res?.data || res;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) handleMarkAsRead(notif._id);
    if (notif.relatedOrder) onNavigate('order-detail', { orderId: notif.relatedOrder });
    else if (notif.relatedSupport) onNavigate('support');
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Spinner size="lg" />
        <Typography variant="body" style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Loading notifications...
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <Typography variant="h2" style={{ fontSize: '1.3rem', marginBottom: '2px' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-brand)', fontWeight: 600 }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginBottom: '12px', padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: '6px' }}>
          ⚠️ {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔔</div>
          <Typography variant="h3" style={{ marginBottom: '4px' }}>No Notifications</Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)' }}>
            You&apos;ll be notified here when there are updates to your orders, payments, or support conversations.
          </Typography>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {notifications.map((notif) => (
            <Card
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              style={{
                cursor: 'pointer',
                backgroundColor: notif.isRead ? 'var(--bg-surface)' : 'rgba(37, 99, 235, 0.04)',
                borderColor: notif.isRead ? 'var(--border-subtle)' : 'var(--color-brand)',
                borderWidth: notif.isRead ? '1px' : '1.5px',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
            >
              <CardBody style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                    {NOTIFICATION_ICONS[notif.type] || '🔔'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontWeight: notif.isRead ? 500 : 700,
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                      }}>
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          backgroundColor: 'var(--color-brand)', flexShrink: 0,
                        }} aria-label="Unread" />
                      )}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      }) : ''}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: 'var(--space-3)' }}>
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => loadNotifications(page - 1)}>
                ← Prev
              </Button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                Page {page} of {totalPages}
              </span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => loadNotifications(page + 1)}>
                Next →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
