import React from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PUBLIC_CONFIG } from '../../config/public.js';

export const TermsPage = ({ onNavigate = () => {} }) => {
  return (
    <Container size="narrow" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
      <Card>
        <CardHeader
          title="Terms of Service"
          description="Operational terms governing India-to-Nepal sourcing and courier delivery"
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
            <strong>Notice:</strong> This document is labeled as a <em>Draft for Review</em>. Actual terms are determined strictly by verified invoice quotes and applicable cross-border transit regulations.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <div>
              <Typography variant="h3" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                1. Sourcing Request &amp; Quote Calculation
              </Typography>
              <p style={{ margin: 0 }}>
                {PUBLIC_CONFIG.BRAND_NAME} provides cross-border procurement assistance. Submitted URLs are verified by our logistics team in India. Official quotes are calculated server-side based on authentic store prices and prevailing currency conversion multipliers.
              </p>
            </div>

            <div>
              <Typography variant="h3" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                2. Order Confirmation &amp; Payment Arrangements
              </Typography>
              <p style={{ margin: 0 }}>
                Customers may select 100% online prepayment or a 50% advance / 50% Cash on Delivery structure. Orders are initiated upon verified receipt of advance payment.
              </p>
            </div>

            <div>
              <Typography variant="h3" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                3. Customs &amp; Courier Transit to Nepal
              </Typography>
              <p style={{ margin: 0 }}>
                All parcels undergo standard inspection and customs clearance at Nepal borders before final dispatch to customer addresses in Kathmandu valley and countrywide locations.
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

export default TermsPage;
