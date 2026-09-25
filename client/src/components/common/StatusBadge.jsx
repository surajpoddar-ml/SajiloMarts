import React from 'react';

export const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  quote_ready: 'Quote Ready',
  customer_confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  converted: 'Converted to Order',
};

/**
 * SastoMarts Accessible Status Badge Component
 */
export const StatusBadge = ({
  status = 'draft',
  label,
  showDot = true,
  className = '',
  ...props
}) => {
  const normalizedStatus = String(status).toLowerCase();
  const displayLabel = label || STATUS_LABELS[normalizedStatus] || normalizedStatus;
  const badgeClass = `status-badge status-badge--${normalizedStatus} ${className}`.trim();

  return (
    <span className={badgeClass} role="status" aria-label={`Status: ${displayLabel}`} {...props}>
      {showDot && <span className="status-badge__dot" aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
