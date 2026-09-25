import React from 'react';
import { Card, CardBody, Typography } from '../../components/common';

/**
 * CodModeInfoCard
 * Clearly presents the 50% Online Prepayment + 50% Doorstep Cash on Delivery terms.
 */
export const CodModeInfoCard = ({ breakdown }) => {
  if (!breakdown || !breakdown.isCod) return null;

  return (
    <Card style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🤝</span>
        <div>
          <Typography variant="h3" style={{ fontSize: '1rem', color: '#92400E', marginBottom: '4px' }}>
            50% Advance Online + 50% Cash on Delivery (COD)
          </Typography>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#78350F', lineHeight: 1.5 }}>
            To procure your items from Indian stores, SajiloMarts requires a <strong>50% online advance deposit (NPR {Number(breakdown.amountPayableNowNpr).toLocaleString()})</strong>.
            The remaining <strong>50% (NPR {Number(breakdown.remainingCodAmountNpr).toLocaleString()})</strong> is payable in cash when our courier delivers the parcel to your doorstep in Nepal.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: '#FDE68A',
            color: '#78350F',
          }}>
            &bull; Fixed 50/50 Sourcing Split (22% Surcharge Applied)
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CodModeInfoCard;
