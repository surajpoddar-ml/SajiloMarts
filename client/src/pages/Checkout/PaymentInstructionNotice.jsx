import React from 'react';
import { Card, CardBody, Typography } from '../../components/common';

/**
 * PaymentInstructionNotice
 * Displays factual payment verification process steps and realistic expectations.
 */
export const PaymentInstructionNotice = () => {
  return (
    <Card style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)' }}>
      <CardBody>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.4rem' }} aria-hidden="true">ℹ️</span>
          <div>
            <Typography variant="h3" style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              How SajiloMarts Payment Verification Works
            </Typography>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              1. Transfer the exact amount via your selected Nepal wallet or bank.<br />
              2. Enter the official <strong>Transaction Reference Code</strong> from your payment receipt.<br />
              3. Upload a clear screenshot/photo of the completed payment proof.<br />
              4. Our Kathmandu fulfillment desk verifies the transaction and initiates procurement from India.
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              * Payments are manually audited against bank records before order dispatch to ensure 100% financial security.
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default PaymentInstructionNotice;
