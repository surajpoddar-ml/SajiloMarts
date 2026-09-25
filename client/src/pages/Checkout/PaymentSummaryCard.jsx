import React from 'react';
import { Card, CardHeader, CardBody, Typography, StatusBadge } from '../../components/common';
import { PAYMENT_MODES, PAYMENT_METHOD_CONFIGS } from '../../utils/paymentCalculations.js';

/**
 * PaymentSummaryCard
 * Displays authoritative monetary breakdown: Total Order Amount, Amount Payable Now, and Remaining COD.
 * Strictly adheres to server calculations.
 */
export const PaymentSummaryCard = ({
  quote,
  paymentMode = PAYMENT_MODES.FULL_ONLINE,
  paymentMethod,
}) => {
  if (!quote) return null;

  const isCod = paymentMode === PAYMENT_MODES.COD_50_50;
  const methodConfig = paymentMethod ? PAYMENT_METHOD_CONFIGS[paymentMethod] : null;

  const finalAmount = quote.finalAmountNpr || 0;
  const payNowAmount = quote.payNowAmountNpr !== undefined ? quote.payNowAmountNpr : (isCod ? Math.round(finalAmount / 2) : finalAmount);
  const remainingCodAmount = quote.remainingCodAmountNpr !== undefined ? quote.remainingCodAmountNpr : (isCod ? finalAmount - payNowAmount : 0);

  return (
    <Card className="payment-summary-card" style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h4" style={{ fontSize: '1.15rem', fontWeight: 600 }}>
            Payment Summary
          </Typography>
          <StatusBadge status="info">
            {isCod ? '50% COD Mode' : '100% Online Payment'}
          </StatusBadge>
        </div>
      </CardHeader>
      <CardBody>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {methodConfig && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-color)' }}>
              <Typography variant="body" style={{ color: 'var(--text-secondary)' }}>
                Selected Gateway
              </Typography>
              <Typography variant="body" style={{ fontWeight: 600 }}>
                {methodConfig.name}
              </Typography>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body" style={{ color: 'var(--text-secondary)' }}>
              Total Order Amount (NPR)
            </Typography>
            <Typography variant="body" style={{ fontWeight: 600, fontSize: '1.05rem' }}>
              NPR {finalAmount.toLocaleString('en-IN')}
            </Typography>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-brand-50, rgba(37, 99, 235, 0.05))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-brand)',
            }}
          >
            <div>
              <Typography variant="body" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>
                Amount Payable Now
              </Typography>
              <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block' }}>
                {isCod ? '50% Advance Online Deposit' : '100% Prepayment'}
              </Typography>
            </div>
            <Typography variant="h3" style={{ color: 'var(--color-brand)', fontSize: '1.35rem', fontWeight: 700 }}>
              NPR {payNowAmount.toLocaleString('en-IN')}
            </Typography>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-1)' }}>
            <div>
              <Typography variant="body" style={{ color: 'var(--text-secondary)' }}>
                Remaining Balance (COD)
              </Typography>
              <Typography variant="caption" style={{ color: 'var(--text-tertiary)', display: 'block' }}>
                {isCod ? 'Payable in Cash on Delivery in Nepal' : 'No balance remaining'}
              </Typography>
            </div>
            <Typography variant="body" style={{ fontWeight: isCod ? 600 : 400, color: isCod ? 'var(--color-warning, #d97706)' : 'var(--text-tertiary)' }}>
              NPR {remainingCodAmount.toLocaleString('en-IN')}
            </Typography>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PaymentSummaryCard;
