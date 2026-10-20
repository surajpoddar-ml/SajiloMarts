import React from 'react';
import { Container } from '../../components/layout';
import { Typography, Button } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';

/**
 * Premium SastoMarts Hero Section
 * Communicates the core service value proposition and provides quick CTAs.
 */
export const HeroSection = ({ onNavigate, isAuthenticated, children }) => {
  return (
    <section className="hero-section" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      paddingTop: 'var(--space-16)',
      paddingBottom: 'var(--space-16)',
      position: 'relative',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
          {/* Minimal Pill Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-5)',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand)',
              display: 'inline-block',
            }} />
            <Typography variant="caption" style={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              India &rarr; Nepal Cross-Border Delivery
            </Typography>
          </div>

          {/* Minimal Headline */}
          <Typography variant="display" style={{
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: 'var(--space-4)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.15,
            fontWeight: 800,
          }}>
            Shop from India. <br />
            <span style={{ color: 'var(--color-brand)' }}>Delivered to your doorstep in Nepal.</span>
          </Typography>

          <Typography variant="body" style={{
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto var(--space-8)',
            fontSize: '1rem',
            lineHeight: 1.6,
          }}>
            Paste any product link from top Indian marketplaces. We handle international purchasing, customs clearance, and insured delivery in Nepal.
          </Typography>

          {/* Action Buttons: Get Started & Sign In */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            margin: '0 auto var(--space-8)',
          }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate(isAuthenticated ? 'sourcing-new' : 'register')}
              style={{ minWidth: '160px', borderRadius: '10px' }}
            >
              {isAuthenticated ? 'Start Sourcing' : 'Get Started'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate(isAuthenticated ? 'account' : 'login')}
              style={{ minWidth: '140px', borderRadius: '10px' }}
            >
              {isAuthenticated ? 'My Account' : 'Sign In'}
            </Button>
          </div>

          {/* Supported Stores Minimal Tag Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}>
            <span style={{ opacity: 0.6 }}>Supports:</span>
            <span>Amazon.in</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Flipkart</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Myntra</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Nykaa</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Meesho</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>Tata 1mg</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>AJIO</span>
          </div>

          {children}
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;


