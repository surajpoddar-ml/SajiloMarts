import React from 'react';
import { Card, CardHeader, CardBody, Typography, StatusBadge } from '../../components/common';

/**
 * Authoritative Quote Review Component
 * Displays transparent server-calculated pricing breakdown, exchange multipliers, and logistics fees.
 */
export const AuthoritativeQuoteReview = ({ request }) => {
  if (!request) return null;

  const quote = request.quote || {};
  const inrPrice = request.productPriceInr || quote.productPriceInr || quote.sourceSubtotalInr;
  const quantity = request.quantity || 1;
  const inrSubtotal = quote.subtotalInr || (inrPrice ? inrPrice * quantity : null);
  const conversionRate = quote.conversionMultiplier || quote.exchangeRate || 1.65;
  const convertedNpr = quote.convertedAmountNpr || quote.convertedNpr || (inrSubtotal ? (inrSubtotal * conversionRate).toFixed(2) : null);
  const feeRate = quote.appliedRate || quote.feeRate || (request.paymentMode === 'cod_50_50' ? 0.22 : 0.18);
  const finalNpr = quote.finalAmountNpr || quote.finalNprTotal;
  const payNowNpr = quote.amountPayableNow || quote.payNowAmountNpr || (request.paymentMode === 'cod_50_50' && finalNpr ? (finalNpr * 0.5).toFixed(2) : finalNpr);
  const codNpr = quote.remainingCodAmount || quote.remainingCodAmountNpr || (request.paymentMode === 'cod_50_50' && finalNpr ? (finalNpr * 0.5).toFixed(2) : 0);

  return (
    <Card className="checkout-quote-review" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardHeader
        title="Authoritative Sourcing Quote Review"
        description="Calculated server-side with verified customs, courier, and import clearance fees"
      />
      <CardBody>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {/* Product Overview */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: '1 1 320px' }}>
              <Typography variant="caption" style={{ textTransform: 'uppercase', color: 'var(--color-brand)', fontWeight: 600 }}>
                {request.marketplace || 'Indian Marketplace Item'}
              </Typography>
              <Typography variant="h3" style={{ fontSize: '1.05rem', margin: '4px 0', color: 'var(--text-primary)' }}>
                {request.productName}
              </Typography>
              {request.productUrl && (
                <a
                  href={request.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--color-brand)', textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                  View Original Product Listing &rarr;
                </a>
              )}
            </div>
            <div style={{ textAlign: 'right', minWidth: '120px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quantity</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{quantity} unit(s)</div>
              {request.variant && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Variant: {request.variant}
                </div>
              )}
            </div>
          </div>

          {/* Mathematical Breakdown Table */}
          <div style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'var(--bg-surface)',
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Indian Store Subtotal</span>
                <strong style={{ fontSize: '0.95rem' }}>{inrSubtotal ? `₹${Number(inrSubtotal).toLocaleString()}` : 'Pending Listing Review'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Conversion Multiplier</span>
                <strong style={{ fontSize: '0.95rem' }}>1 INR = {conversionRate} NPR</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Converted NPR Subtotal</span>
                <strong style={{ fontSize: '0.95rem' }}>{convertedNpr ? `NPR ${Number(convertedNpr).toLocaleString()}` : 'Calculated at Review'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Logistics &amp; Customs Surcharge</span>
                <strong style={{ fontSize: '0.95rem' }}>{Math.round(feeRate * 100)}% ({request.paymentMode === 'cod_50_50' ? '50/50 COD' : '100% Online Prepayment'})</strong>
              </div>
            </div>

            {/* Total Highlight Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Total Landed Price (Nepal Doorstep):
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Includes all cross-border taxes, courier handling, and delivery
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                  {finalNpr ? `NPR ${Number(finalNpr).toLocaleString()}` : 'Pending Quote Generation'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AuthoritativeQuoteReview;
