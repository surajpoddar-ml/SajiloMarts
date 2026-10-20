import React from 'react';
import { HeroSection } from './HeroSection.jsx';
import { HowItWorksSection } from './HowItWorksSection.jsx';
import { Container, Section } from '../../components/layout';
import { Typography, Button, Card } from '../../components/common';

/**
 * Minimal SastoMarts Official Public Landing Page
 * Clean, fast, modern, and uncluttered.
 */
export function HomePage({
  onNavigate,
  user,
  isAuthenticated,
}) {
  return (
    <div className="homepage" id="sastomarts-homepage">
      {/* 1. Minimal Hero with Direct URL Input & Supported Stores */}
      <HeroSection
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated}
      />

      {/* 2. Sleek 4-Step How It Works Flow */}
      <HowItWorksSection />

      {/* 3. Minimal Bottom Action Strip */}
      <Section size="md" style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-12)',
      }}>
        <Container size="standard">
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            textAlign: 'center',
            padding: 'var(--space-6) var(--space-4)',
          }}>
            <Typography variant="h2" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>
              Ready to Order from India?
            </Typography>
            <p style={{ margin: '0 auto var(--space-6)', fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '480px' }}>
              Create an account or sign in to submit your product links, get instant quotes, and track cross-border deliveries.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate(isAuthenticated ? 'sourcing-new' : 'login')}
              >
                {isAuthenticated ? 'Create Sourcing Request' : 'Sign In / Register'}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate('track-order')}
              >
                Track An Order
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}

export default HomePage;

