import React from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PUBLIC_CONFIG } from '../../config/public.js';

export const PrivacyPage = ({ onNavigate = () => {} }) => {
  return (
    <Container size="narrow" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
      <Card>
        <CardHeader
          title="Privacy Policy"
          description="Information collection and data handling for SastoMarts sourcing services"
        />
        <CardBody>
          <div style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--color-brand)',
            marginBottom: 'var(--space-6)',
            fontSize: '0.85rem',
          }}>
            <strong>Notice:</strong> This document is labeled as a <em>Draft for Review</em>. Data privacy controls strictly isolate customer sourcing records by verified account ownership.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <div>
              <Typography variant="h3" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                1. Data Collected for Sourcing
              </Typography>
              <p style={{ margin: 0 }}>
                We collect customer-provided product links, product specifications, quantities, notes, and delivery destination details to fulfill procurement orders.
              </p>
            </div>

            <div>
              <Typography variant="h3" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                2. Data Protection &amp; Ownership
              </Typography>
              <p style={{ margin: 0 }}>
                All user accounts and sourcing records are secured with strict access controls. Customer quotes and addresses are never exposed publicly or shared with unauthorized third parties.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
            <Button variant="outline" onClick={() => onNavigate('home')}>
              &larr; Back to Homepage
            </Button>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

export default PrivacyPage;
