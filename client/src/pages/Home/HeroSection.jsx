import React from 'react';
import { Container } from '../../components/layout';
import { Typography, Button } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';

/**
 * Premium SastoMarts Hero Section
 * Communicates the core service value proposition and provides quick CTAs.
 */
export const HeroSection = ({ onNavigate, isAuthenticated, children }) => {
  const handleStartSourcing = () => {
    if (onNavigate) {
      onNavigate(isAuthenticated ? 'sourcing-new' : 'login');
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      paddingTop: 'var(--space-12)',
      paddingBottom: 'var(--space-12)',
      position: 'relative',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
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
              Seamless Cross-Border Sourcing: India &rarr; Nepal
            </Typography>
          </div>

          <Typography variant="display" style={{
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: 'var(--space-4)',
            lineHeight: 1.15,
          }}>
            Shop Anything from India. <br />
            <span style={{ color: 'var(--color-brand)' }}>We Deliver Right to Your Doorstep in Nepal.</span>
          </Typography>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
          }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartSourcing}
            >
              {isAuthenticated ? 'Create Sourcing Request' : 'Get Started / Sign In'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToHowItWorks}
            >
              Learn How It Works &darr;
            </Button>
          </div>
          {children}
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;

