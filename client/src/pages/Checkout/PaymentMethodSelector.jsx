import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '../../components/common';

export const PAYMENT_OPTIONS = [
  {
    id: 'esewa',
    name: 'eSewa Digital Wallet',
    badge: '100% Online Prepayment',
    type: 'online_100',
    description: 'Instant full wallet transfer. 18% standard cross-border service and courier handling fee.',
    logoText: '🟢 eSewa',
  },
  {
    id: 'khalti',
    name: 'Khalti Digital Wallet',
    badge: '100% Online Prepayment',
    type: 'online_100',
    description: 'Full wallet prepayment via Khalti mobile app. 18% standard cross-border fee applied.',
    logoText: '🟣 Khalti',
  },
  {
    id: 'mypay',
    name: 'MyPay Mobile Wallet',
    badge: '100% Online Prepayment',
    type: 'online_100',
    description: 'Full online payment via MyPay digital payment wallet with 18% service fee.',
    logoText: '🔴 MyPay',
  },
  {
    id: 'cod_50_50',
    name: '50% Online / 50% Cash on Delivery',
    badge: 'Partial Prepayment + COD',
    type: 'cod_50_50',
    description: 'Pay 50% advance online for Indian procurement; pay the remaining 50% in cash upon Nepal doorstep delivery. 22% COD fee applied.',
    logoText: '🤝 50/50 COD',
  },
];

export const PaymentMethodSelector = ({
  selectedMethod = 'esewa',
  onSelectMethod,
  disabled = false,
}) => {
  return (
    <Card className="checkout-payment-selector" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardHeader
        title="Select Payment Method"
        description="Choose your preferred Nepal digital wallet or flexible 50% Cash on Delivery split"
      />
      <CardBody>
        <div
          role="radiogroup"
          aria-label="Payment Method Options"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}
        >
          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = selectedMethod === option.id;
            return (
              <div
                key={option.id}
                onClick={() => !disabled && onSelectMethod(option.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
                    e.preventDefault();
                    onSelectMethod(option.id);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--color-brand)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  outline: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {option.logoText} {option.name}
                  </span>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid var(--color-brand)' : '2px solid var(--border-subtle)',
                      backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                </div>

                <div style={{
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: option.type === 'cod_50_50' ? '#FEF3C7' : '#E0E7FF',
                  color: option.type === 'cod_50_50' ? '#92400E' : '#3730A3',
                }}>
                  {option.badge}
                </div>

                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {option.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default PaymentMethodSelector;
