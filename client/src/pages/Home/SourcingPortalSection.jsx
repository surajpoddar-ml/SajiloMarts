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
    <Section id="sourcing-portal" size="sm" style={{
      backgroundColor: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-subtle)',
      paddingTop: 'var(--space-4)',
      paddingBottom: 'var(--space-8)',
    }}>
      <Container size="standard">
        {/* Sourcing Portal Inner Flow / Slot */}
        <div className="sourcing-portal-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
          {children}
        </div>
      </Container>
    </Section>
  );
};

export default SourcingPortalSection;
