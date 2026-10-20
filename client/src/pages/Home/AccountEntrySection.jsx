import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, Button, Typography } from '../../components/common';

/**
 * AccountEntrySection
 * Informational section on the public landing page describing account benefits.
 * The actual sourcing request list, order management, and account features
 * are available inside the Customer Account portal after login.
 */
export const AccountEntrySection = ({
  onNavigate = () => {},
}) => {
  const accountBenefits = [
    {
      icon: '📦',
      title: 'Sourcing Requests',
      points: [
        'Submit Indian store links',
        'Receive official NPR quotes',
      ],
    },
    {
      icon: '🚚',
      title: 'Order Management',
      points: [
        'Track active cross-border orders',
        'Complete purchase history',
      ],
    },
    {
      icon: '📍',
      title: 'Saved Addresses',
      points: [
        'Save multiple delivery spots',
        'Faster 1-click checkout',
      ],
    },
    {
      icon: '🔒',
      title: 'Account Security',
      points: [
        'Verified account protection',
        'Secure password & Google login',
      ],
    },
  ];

  return (
    <Section id="customer-account-entry" size="md" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Customer Portal
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Customer Account & Sourcing History
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          maxWidth: '760px',
          margin: '0 auto var(--space-6)',
        }}>
          {accountBenefits.map((benefit, idx) => (
            <Card key={idx} style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '20px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '8px' }} aria-hidden="true">
                {benefit.icon}
              </div>
              <Typography variant="h3" style={{ fontSize: '0.975rem', fontWeight: 600, marginBottom: '8px' }}>
                {benefit.title}
              </Typography>
              <ul style={{
                margin: 0,
                paddingLeft: '1.1rem',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                textAlign: 'left',
              }}>
                {benefit.points.map((pt, pIdx) => (
                  <li key={pIdx} style={{ marginBottom: '3px' }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Card style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: 'var(--bg-page)',
            padding: '24px',
            textAlign: 'center',
            border: '1px dashed var(--border-subtle)',
          }}>
            <Typography variant="h3" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px' }}>
              Ready to get started?
            </Typography>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
              Sign in to access your dashboard or create a free account to begin sourcing products from India.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => onNavigate('login')}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => onNavigate('register')}>
                Create Free Account
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
};

export default AccountEntrySection;
