import React from 'react';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Container } from '../../components/layout/Container.jsx';

/**
 * SajiloMarts Reusable Not Found (404) Page
 */
export const NotFoundPage = ({ onNavigateHome = () => {} }) => {
  return (
    <Container size="narrow">
      <div style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <Card style={{ padding: 'var(--space-10) var(--space-6)' }}>
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              color: 'var(--color-brand)',
              lineHeight: 1,
              marginBottom: 'var(--space-3)',
            }}
          >
            404
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 var(--space-2)',
            }}
          >
            Page Not Found
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              maxWidth: '420px',
              margin: '0 auto var(--space-6)',
            }}
          >
            The requested page or sourcing resource could not be found. Please check the address or return to the home screen.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <Button
              variant="primary"
              onClick={onNavigateHome}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default NotFoundPage;
