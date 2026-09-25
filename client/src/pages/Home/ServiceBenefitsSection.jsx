import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, Typography } from '../../components/common';

const SERVICE_CHARACTERISTICS = [
  {
    icon: '🇮🇳 📦',
    title: 'India Product Sourcing',
    description: 'Procure verified products directly from Indian e-commerce merchants and verified brand distributors.',
  },
  {
    icon: '🧮 🔍',
    title: 'Transparent Server Pricing',
    description: 'Authoritative quote engine with fixed 1 INR = 1.65 NPR exchange multiplier and clear breakdown of customs and logistics fees.',
  },
  {
    icon: '🇳🇵 🚚',
    title: 'Nepal Countrywide Delivery',
    description: 'Direct courier delivery to your doorstep across Kathmandu valley and major regional hubs throughout Nepal.',
  },
  {
    icon: '🛡️ 💬',
    title: 'Dedicated Customer Support',
    description: 'Direct communication with Kathmandu-based fulfillment managers for tracking, custom orders, and order assistance.',
  },
];

/**
 * ServiceBenefitsSection
 * Factually communicates core service capabilities without fabricated statistics or fake guarantees.
 */
export const ServiceBenefitsSection = () => {
  return (
    <Section id="service-benefits" size="md" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="wide">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Reliable Cross-Border Logistics
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Why Source with SastoMarts
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: 'var(--space-2) auto 0' }}>
            Built specifically to solve cross-border e-commerce hurdles between India and Nepal with verifiable fulfillment.
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {SERVICE_CHARACTERISTICS.map((item) => (
            <Card key={item.title} style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '24px 20px',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px' }} aria-hidden="true">
                {item.icon}
              </div>

              <Typography variant="h3" style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {item.title}
              </Typography>

              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default ServiceBenefitsSection;
