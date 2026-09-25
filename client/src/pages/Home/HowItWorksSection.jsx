import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardBody, Typography } from '../../components/common';

const WORKFLOW_STEPS = [
  {
    step: '1',
    title: 'Find Product in India',
    description: 'Browse Amazon India, Flipkart, Myntra, Meesho, or Tata 1mg to find the specific item or variant you want.',
  },
  {
    step: '2',
    title: 'Paste Product URL',
    description: 'Paste the direct product web link into SastoMarts. We verify the marketplace listing and capture product parameters.',
  },
  {
    step: '3',
    title: 'Receive Server Quote',
    description: 'Our backend pricing engine calculates the transparent converted cost in NPR, including shipping, customs, and applicable fees.',
  },
  {
    step: '4',
    title: 'Confirm Request & Payment',
    description: 'Review the authoritative quote breakdown, choose online prepayment or 50/50 COD, and confirm your request.',
  },
  {
    step: '5',
    title: 'Procurement & Nepal Delivery',
    description: 'Our Kathmandu logistics center purchases the item in India, inspects customs clearance, and delivers directly to your address in Nepal.',
  },
];

/**
 * HowItWorksSection
 * Concisely and factually explains the 5-step cross-border sourcing & delivery process.
 */
export const HowItWorksSection = () => {
  return (
    <Section id="how-it-works" size="md" style={{
      backgroundColor: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="wide">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Simple 5-Step Process
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            How SastoMarts Works
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: 'var(--space-2) auto 0' }}>
            We bridge the gap between Indian e-commerce platforms and customers across Nepal with full pricing transparency.
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '20px',
        }}>
          {WORKFLOW_STEPS.map((item) => (
            <Card key={item.step} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              padding: '20px 16px',
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginBottom: '12px',
              }}>
                {item.step}
              </div>

              <Typography variant="h3" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {item.title}
              </Typography>

              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorksSection;
