import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardHeader, CardBody, Button, Typography } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';

/**
 * SupportEntrySection
 * Provides genuine customer support entry channels (Email desk, FAQ guidance, and Request Inquiries)
 * without fake chat bots, fake agents, or unverified response claims.
 */
export const SupportEntrySection = ({ onNavigate = () => {} }) => {
  return (
    <Section id="support-entry" size="md" style={{
      backgroundColor: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Customer Assistance
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Need Help with a Product or Sourcing?
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: 'var(--space-2) auto 0' }}>
            Our Kathmandu support team is available to assist with custom quotes, customs inquiries, or delivery updates.
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          maxWidth: '680px',
          margin: '0 auto',
        }}>
          <Card style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '24px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }} aria-hidden="true">
              📧
            </div>
            <Typography variant="h3" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
              Direct Email Helpdesk
            </Typography>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Send product links, bulk purchase requests, or general inquiries directly to our support desk.
            </p>
            <a
              href={`mailto:${PUBLIC_CONFIG.SUPPORT_EMAIL}`}
              style={{
                display: 'inline-block',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--color-brand)',
                textDecoration: 'none',
              }}
            >
              {PUBLIC_CONFIG.SUPPORT_EMAIL}
            </a>
          </Card>

          <Card style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '24px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }} aria-hidden="true">
              📋
            </div>
            <Typography variant="h3" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
              Order &amp; Quote Inquiries
            </Typography>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Track an existing consignment or submit a new inquiry regarding an Indian product request.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('support')}
            >
              Open Support Portal
            </Button>
          </Card>
        </div>
      </Container>
    </Section>
  );
};

export default SupportEntrySection;
