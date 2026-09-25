import React from 'react';
import { Container } from '../../components/layout';
import { Typography } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';

/**
 * Premium SastoMarts Hero Section
 * Communicates the core service value proposition and hosts the primary product URL sourcing entry.
 */
export const HeroSection = ({ children }) => {
  return (
    <section className="hero-section" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      paddingTop: 'var(--space-12)',
      paddingBottom: 'var(--space-16)',
      position: 'relative',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-4)',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand)',
              display: 'inline-block',
            }} />
            <Typography variant="caption" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Cross-Border India &rarr; Nepal Delivery
            </Typography>
          </div>

          <Typography variant="display" style={{
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: 'var(--space-4)',
            lineHeight: 1.15,
          }}>
            Shop from India. <br />
            <span style={{ color: 'var(--color-brand)' }}>We Deliver to Nepal.</span>
          </Typography>

          <Typography variant="lead" style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
            maxWidth: '640px',
            margin: '0 auto var(--space-8)',
          }}>
            Find any item on Amazon India, Flipkart, Myntra, Meesho, or Tata 1mg. Paste the product link below to verify and generate an authoritative server quote.
          </Typography>

          {/* Child Slot for Product URL Sourcing Form */}
          {children}
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
