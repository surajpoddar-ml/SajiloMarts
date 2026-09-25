import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, Button, Typography } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';

/**
 * SupportEntrySection
 * Provides genuine customer support entry channels (Direct Email Helpdesk & DM on Instagram)
 * without fake chat bots or unverified claims.
 */
export const SupportEntrySection = ({ onNavigate = () => {} }) => {
  return (
    <Section id="support-section" size="md" style={{
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
          {/* Email Helpdesk */}
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

          {/* DM on Instagram */}
          <Card style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            padding: '24px 20px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }} aria-hidden="true">
              📸
            </div>
            <Typography variant="h3" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
              DM on Instagram
            </Typography>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Send us a direct message on Instagram for fast sourcing quotes, product links, and support updates.
            </p>
            <a
              href={PUBLIC_CONFIG.INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#FFFFFF',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
            >
              <span>DM @sajilomarts</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </Card>
        </div>
      </Container>
    </Section>
  );
};

export default SupportEntrySection;
