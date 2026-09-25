import React, { useState } from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardHeader, CardBody, Typography, Button, StatusBadge } from '../../components/common';
import { detectMarketplace } from '../../utils/formValidation.js';

/**
 * SastoMarts Sourcing Portal Section Layout
 * Hosts the active interactive request configuration, review, and authoritative quote presentation.
 */
export const SourcingPortalSection = ({
  initialProductUrl = '',
  user,
  isAuthenticated,
  onNavigate,
  onRequestCreated,
  children,
}) => {
  return (
    <Section id="sourcing-portal" size="md" style={{
      backgroundColor: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Interactive Product Sourcing
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Configure Your Product Request
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: 'var(--space-2) auto 0' }}>
            Enter your exact product specifications below. Our Kathmandu fulfillment team will verify the listing and calculate the official cross-border quote.
          </Typography>
        </div>

        {/* Sourcing Portal Inner Flow / Slot */}
        <div className="sourcing-portal-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          {children}
        </div>
      </Container>
    </Section>
  );
};

export default SourcingPortalSection;
