import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, Typography } from '../../components/common';

const SERVICE_CHARACTERISTICS = [
  {
    icon: '🇮🇳 📦',
    title: 'India Product Sourcing',
    points: [
      'Direct merchant procurement',
      '100% genuine products verified',
    ],
  },
  {
    icon: '🧮 🔍',
    title: 'Transparent Pricing',
    points: [
      'Fixed INR to NPR rate',
      'No surprise customs or taxes',
    ],
  },
  {
    icon: '🇳🇵 🚚',
    title: 'Nepal-Wide Delivery',
    points: [
      'Kathmandu valley & all provinces',
      'Doorstep delivery with tracking',
    ],
  },
  {
    icon: '🛡️ 💬',
    title: 'Dedicated Support',
    points: [
      'Local Kathmandu support team',
      'Fast assistance on orders',
    ],
  },
];

/**
 * ServiceBenefitsSection
 * Highlights core service advantages with concise points.
 */
export const ServiceBenefitsSection = () => {
  return (
    <Section id="service-benefits" size="md" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="wide">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Reliable Cross-Border Logistics
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Why Source with SajiloMarts
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {SERVICE_CHARACTERISTICS.map((item) => (
            <Card key={item.title} style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '20px 18px',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '10px' }} aria-hidden="true">
                {item.icon}
              </div>

              <Typography variant="h3" style={{ fontSize: '1.025rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {item.title}
              </Typography>

              <ul style={{
                margin: 0,
                paddingLeft: '1.1rem',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                {item.points.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default ServiceBenefitsSection;
