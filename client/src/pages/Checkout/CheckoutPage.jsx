import React, { useState, useEffect } from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardHeader, CardBody, Button, Typography, StatusBadge } from '../../components/common';
import { Spinner } from '../../components/feedback/Spinner.jsx';
import { productRequestService } from '../../services/productRequest.service.js';

/**
 * SajiloMarts Checkout & Payment Proof Experience
 * Step-by-step customer checkout: Quote Review -> Payment Method -> Instructions & QR -> Proof Upload -> Address -> Submit
 */
export const CheckoutPage = ({
  requestId,
  user,
  onNavigate = () => {},
  onPaymentSubmitted,
  onBack,
}) => {
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!requestId) {
      setError('No sourcing request selected for checkout.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    productRequestService.getRequestDetails(requestId)
      .then((res) => {
        if (isMounted) {
          const reqData = res.data || res;
          setRequest(reqData);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load sourcing request for checkout.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestId]);

  if (isLoading) {
    return (
      <Container size="narrow" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <Spinner size="lg" />
        <Typography variant="body" style={{ marginTop: 'var(--space-4)', color: 'var(--text-secondary)' }}>
          Retrieving authoritative quote and payment parameters...
        </Typography>
      </Container>
    );
  }

  if (error || !request) {
    return (
      <Container size="narrow" style={{ padding: 'var(--space-8) 0' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <Typography variant="h2" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
            Checkout Unavailable
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            {error || 'Unable to retrieve sourcing request for checkout.'}
          </Typography>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="outline" onClick={() => onNavigate('sourcing-requests')}>
              &larr; Return to Sourcing Requests
            </Button>
            <Button variant="primary" onClick={() => onNavigate('home')}>
              Go to Homepage
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <div className="checkout-page" id="sajilomarts-checkout">
      <Section size="md">
        <Container size="standard">
          <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
                Step 2 of 2: Checkout &amp; Payment Proof
              </Typography>
              <Typography variant="h1" style={{ marginTop: 'var(--space-1)', fontSize: '1.75rem' }}>
                Confirm Quote &amp; Submit Payment
              </Typography>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack || (() => onNavigate('sourcing-requests'))}>
              &larr; Back to Requests
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--space-6)' }}>
            <Card>
              <CardHeader
                title="Sourcing Request &amp; Quote Summary"
                description={`Reference: ${request._id || request.id}`}
              />
              <CardBody>
                <div style={{ display: 'grid', gap: '12px', fontSize: '0.9rem' }}>
                  <div><strong>Product:</strong> {request.productName}</div>
                  <div><strong>Quantity:</strong> {request.quantity || 1} unit(s)</div>
                  <div><strong>Status:</strong> <StatusBadge status={request.status || 'draft'} /></div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default CheckoutPage;
