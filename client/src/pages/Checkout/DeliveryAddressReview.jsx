import React from 'react';
import { Card, CardHeader, CardBody, Typography, StatusBadge } from '../../components/common';

/**
 * DeliveryAddressReview
 * Displays clean, verified customer delivery address details before final submission.
 * Exposes only necessary recipient and destination details without internal metadata.
 */
export const DeliveryAddressReview = ({ address }) => {
  if (!address) {
    return (
      <Card style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
        <Typography variant="body" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          No delivery address selected yet. Please select or add an address above.
        </Typography>
      </Card>
    );
  }

  const {
    fullName,
    phone,
    label = 'home',
    province,
    district,
    municipality,
    wardNumber,
    tole,
    street,
    landmark,
    country = 'Nepal',
  } = address;

  const addressLine = [
    tole,
    street,
    landmark ? `(Near ${landmark})` : null,
    wardNumber ? `Ward ${wardNumber}` : null,
    municipality,
    district,
    province,
    country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="delivery-address-review-card" style={{ border: '1px solid var(--border-color)' }}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h4" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Delivery Destination
          </Typography>
          <StatusBadge status="success">
            {label.toUpperCase()}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardBody>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <div>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block' }}>
              Recipient
            </Typography>
            <Typography variant="body" style={{ fontWeight: 600 }}>
              {fullName} &bull; <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{phone}</span>
            </Typography>
          </div>

          <div>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block' }}>
              Complete Delivery Address in Nepal
            </Typography>
            <Typography variant="body" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {addressLine}
            </Typography>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DeliveryAddressReview;
