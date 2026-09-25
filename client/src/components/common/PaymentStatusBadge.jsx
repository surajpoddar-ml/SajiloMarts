import React from 'react';

/**
 * PaymentStatusBadge
 * Displays payment status clearly with distinct semantic colorings and accessible text.
 */
export const PaymentStatusBadge = ({ status = 'pending', className = '', ...props }) => {
  const normalizedStatus = String(status || '').toLowerCase().trim();

  const statusConfig = {
    pending: {
      label: 'Payment Pending',
      bg: '#FEF3C7',
      color: '#92400E',
      border: '#FDE68A',
      icon: '⏳',
    },
    proof_submitted: {
      label: 'Proof Submitted',
      bg: '#E0E7FF',
      color: '#3730A3',
      border: '#C7D2FE',
      icon: '📨',
    },
    under_review: {
      label: 'Under Review',
      bg: '#E0F2FE',
      color: '#0369A1',
      border: '#BAE6FD',
      icon: '🔍',
    },
    verified: {
      label: 'Payment Verified',
      bg: '#DCFCE7',
      color: '#166534',
      border: '#BBF7D0',
      icon: '✅',
    },
    rejected: {
      label: 'Proof Rejected',
      bg: '#FEE2E2',
      color: '#991B1B',
      border: '#FECACA',
      icon: '❌',
    },
  };

  const config = statusConfig[normalizedStatus] || {
    label: normalizedStatus ? normalizedStatus.replace('_', ' ') : 'Unknown',
    bg: '#F3F4F6',
    color: '#374151',
    border: '#E5E7EB',
    icon: '•',
  };

  return (
    <span
      className={`payment-status-badge ${className}`}
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        lineHeight: 1.2,
      }}
      {...props}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default PaymentStatusBadge;
