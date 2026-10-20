import React from 'react';
import { Container, Section } from '../../components/layout';
import { Typography } from '../../components/common';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Find Product in India',
    description: 'Find any product on Amazon India, Flipkart, or Myntra and paste the link here.',
  },
  {
    step: '02',
    title: 'Instant NPR Quote',
    description: 'Get an automatic breakdown with currency conversion, customs, and shipping included.',
  },
  {
    step: '03',
    title: 'Pay Locally',
    description: 'Pay safely in Nepali Rupees via eSewa, Khalti, Bank Transfer, or partial COD.',
  },
  {
    step: '04',
    title: 'Procurement & Nepal Delivery',
    description: 'We procure in India, clear customs, and deliver safely right to your address in Nepal.',
  },
];

/**
 * Minimal HowItWorksSection
 */
export const HowItWorksSection = () => {
  return (
    <Section id="how-it-works" size="md" style={{
      backgroundColor: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-subtle)',
      paddingTop: 'var(--space-12)',
      paddingBottom: 'var(--space-12)',
    }}>
      <Container size="wide">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-brand)', fontWeight: 600, fontSize: '0.75rem' }}>
            Simple Workflow
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)', fontSize: '1.75rem', fontWeight: 700 }}>
            How SastoMarts Works
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}>
          {WORKFLOW_STEPS.map((item) => (
            <div key={item.step} style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
            }}>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--color-brand)',
                letterSpacing: '-0.03em',
                marginBottom: '8px',
                opacity: 0.85,
              }}>
                {item.step}
              </span>

              <Typography variant="h3" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                {item.title}
              </Typography>

              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
              }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorksSection;

