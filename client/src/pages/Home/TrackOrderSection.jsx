import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, Button, Typography } from '../../components/common';

/**
 * TrackOrderSection
 * Informational section on the public landing page describing the order tracking capability.
 * The actual tracking form and functionality is available inside the Customer Account portal after login.
 */
export const TrackOrderSection = ({ onNavigate = () => {} }) => {
  const trackingFeatures = [
    {
      icon: '📍',
      title: 'Real-Time Location',
      description: 'See exactly where your parcel is — from Indian warehouse to your Nepal doorstep.',
    },
    {
      icon: '🛃',
      title: 'Customs & Clearance',
      description: 'Get live updates on customs processing, duty assessment, and border clearance status.',
    },
    {
      icon: '🔔',
      title: 'Delivery Notifications',
      description: 'Receive instant alerts when your order ships, clears customs, and is out for delivery.',
    },
  ];

  return (
    <Section id="track-order-section" size="md" style={{
      backgroundColor: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Live Parcel Tracking
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Track Your Cross-Border Order
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: 'var(--space-2) auto 0' }}>
            Every SajiloMarts order includes full visibility — from Indian procurement through customs clearance to final delivery anywhere in Nepal.
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          maxWidth: '760px',
          margin: '0 auto var(--space-6)',
        }}>
          {trackingFeatures.map((feature, idx) => (
            <Card key={idx} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }} aria-hidden="true">
                {feature.icon}
              </div>
              <Typography variant="h3" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
                {feature.title}
              </Typography>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Card style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '24px',
            textAlign: 'center',
            border: '1px dashed var(--border-subtle)',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }} aria-hidden="true">🔐</div>
            <Typography variant="h3" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
              Sign in to track your orders
            </Typography>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
              Access your order tracking dashboard, view real-time shipment status, and manage deliveries from your customer account.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="sm" onClick={() => onNavigate('login')}>
                Sign In to Track
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate('register')}>
                Create Account
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
};

export default TrackOrderSection;
