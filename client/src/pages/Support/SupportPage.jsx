import React, { useState, useEffect, useRef } from 'react';
import { supportService } from '../../services/support.service.js';
import { Card, CardHeader, CardBody, Button, Typography } from '../../components/common';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

/**
 * SajiloMarts Customer Support Page
 * Lists conversations, shows conversation detail with messages, and allows creating new conversations.
 */
export const SupportPage = ({ onNavigate = () => {} }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  // New conversation form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newOrderId, setNewOrderId] = useState('');

  // Message sending
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const res = await supportService.listConversations();
      const data = res?.data || res;
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err.message || 'Failed to load support conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (convId) => {
    try {
      const res = await supportService.getConversation(convId);
      setSelectedConversation(res?.data || res);
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setIsCreating(true);
    try {
      const res = await supportService.createConversation({
        subject: newSubject.trim(),
        message: newMessage.trim(),
        orderId: newOrderId.trim() || undefined,
      });
      const conv = res?.data || res;
      setShowNewForm(false);
      setNewSubject('');
      setNewMessage('');
      setNewOrderId('');
      setSelectedConversation(conv);
      loadConversations();
    } catch (err) {
      setError(err.message || 'Failed to create conversation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedConversation?._id) return;
    setIsSending(true);
    try {
      const res = await supportService.sendMessage(selectedConversation._id, replyContent.trim());
      setSelectedConversation(res?.data || res);
      setReplyContent('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation?._id) return;
    try {
      await supportService.closeConversation(selectedConversation._id);
      setSelectedConversation({ ...selectedConversation, status: 'closed' });
      loadConversations();
    } catch (err) {
      setError(err.message || 'Failed to close conversation');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Spinner size="lg" />
        <Typography variant="body" style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Loading support conversations...
        </Typography>
      </div>
    );
  }

  // Detail view
  if (selectedConversation) {
    const messages = selectedConversation.messages || [];
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)} style={{ marginBottom: 'var(--space-3)' }}>
          ← Back to Conversations
        </Button>
        <Card>
          <CardHeader
            title={selectedConversation.subject}
            description={`Status: ${selectedConversation.status === 'open' ? '🟢 Open' : '🔴 Closed'}${selectedConversation.order ? ` • Linked to Order: ${selectedConversation.order.orderNumber || ''}` : ''}`}
            action={selectedConversation.status === 'open' ? (
              <Button variant="outline" size="sm" onClick={handleCloseConversation}>Close</Button>
            ) : null}
          />
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', padding: '8px 0' }}>
              {messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: msg.senderRole === 'admin' ? '#EDE9FE' : 'var(--bg-surface-secondary)',
                    alignSelf: msg.senderRole === 'admin' ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                    border: msg.senderRole === 'admin' ? '1px solid #C4B5FD' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                    {msg.senderRole === 'admin' ? '🛡️ SajiloMarts Support' : '👤 You'}
                    <span style={{ marginLeft: '8px', fontWeight: 400 }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {selectedConversation.status === 'open' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isSending}
                  maxLength={2000}
                  rows={2}
                  style={{
                    flex: 1,
                    resize: 'vertical',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={isSending || !replyContent.trim()}
                  style={{ alignSelf: 'flex-end' }}
                >
                  {isSending ? '...' : 'Send'}
                </Button>
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginTop: '8px' }}>⚠️ {error}</div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <Typography variant="h2" style={{ fontSize: '1.3rem' }}>Customer Support</Typography>
        <Button variant="primary" size="sm" onClick={() => setShowNewForm(true)}>
          + New Conversation
        </Button>
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginBottom: '12px', padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: '6px' }}>
          ⚠️ {error}
        </div>
      )}

      {showNewForm && (
        <Card style={{ marginBottom: 'var(--space-4)' }}>
          <CardHeader title="New Support Conversation" />
          <CardBody>
            <form onSubmit={handleCreateConversation} style={{ display: 'grid', gap: '12px' }}>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject (e.g. Payment issue, delivery question)"
                required
                minLength={3}
                maxLength={200}
                style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={newOrderId}
                onChange={(e) => setNewOrderId(e.target.value)}
                placeholder="Order ID (optional — link to a specific order)"
                style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Describe your issue..."
                required
                minLength={1}
                maxLength={2000}
                rows={4}
                style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', resize: 'vertical', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Submit'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {conversations.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
          <Typography variant="h3" style={{ marginBottom: '4px' }}>No Support Conversations</Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Have a question about your order or delivery? Start a conversation and our team will respond.
          </Typography>
          <Button variant="primary" size="sm" onClick={() => setShowNewForm(true)}>Start a Conversation</Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conversations.map((conv) => (
            <Card
              key={conv._id}
              style={{ cursor: 'pointer', transition: 'border-color 0.15s', borderColor: 'var(--border-subtle)' }}
              onClick={() => loadConversation(conv._id)}
            >
              <CardBody style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {conv.subject}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {conv.order?.orderNumber ? `Order: ${conv.order.orderNumber} • ` : ''}
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <StatusBadge status={conv.status === 'open' ? 'info' : 'neutral'} label={conv.status === 'open' ? 'Open' : 'Closed'} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportPage;
