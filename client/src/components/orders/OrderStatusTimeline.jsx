import React from 'react';
import { Typography } from '../common/Typography.jsx';
import { FULFILLMENT_STAGES } from '../../constants/order.constants.js';

export { FULFILLMENT_STAGES };


export const OrderStatusTimeline = ({
  currentStatus = 'order_received',
  statusHistory = [],
  createdAt,
}) => {
  // Map historical entries by status key
  const historyMap = React.useMemo(() => {
    const map = {};
    if (Array.isArray(statusHistory)) {
      statusHistory.forEach((entry) => {
        if (entry.status) {
          map[entry.status] = entry;
        }
      });
    }
    return map;
  }, [statusHistory]);

  // Find index of current status in the stages
  const currentStageIndex = FULFILLMENT_STAGES.findIndex(
    (s) => s.key === currentStatus
  );

  const isTerminalCancelled = currentStatus === 'cancelled' || currentStatus === 'refunded';

  if (isTerminalCancelled) {
    return (
      <div
        style={{
          padding: 'var(--space-4)',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
        }}
      >
        <Typography variant="h4" style={{ marginBottom: '4px' }}>
          Order {currentStatus === 'refunded' ? 'Refunded' : 'Cancelled'}
        </Typography>
        <Typography variant="body" style={{ fontSize: '0.85rem' }}>
          This order was {currentStatus}. If you have questions regarding refunds or credits, please reach out to customer support.
        </Typography>
      </div>
    );
  }

  return (
    <div
      className="order-status-timeline"
      style={{ margin: 'var(--space-4) 0' }}
      role="region"
      aria-label="Order fulfillment progress timeline"
    >
      <Typography variant="h3" style={{ fontSize: '1.05rem', marginBottom: 'var(--space-4)' }}>
        Fulfillment Progress
      </Typography>

      <div
        role="list"
        aria-label="Fulfillment steps"
        style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
      >
        {FULFILLMENT_STAGES.map((stage, idx) => {
          const isPassed = currentStageIndex > idx;
          const isCurrent = currentStageIndex === idx || (currentStageIndex === -1 && idx === 0);
          const isUpcoming = currentStageIndex < idx;

          const historyEntry = historyMap[stage.key];
          const hasTimestamp = historyEntry?.changedAt || (idx === 0 && createdAt);
          const timestamp = hasTimestamp ? new Date(historyEntry?.changedAt || createdAt) : null;
          const note = historyEntry?.note;

          // Color & Icon logic
          const circleBg = isPassed
            ? 'var(--color-success)'
            : isCurrent
            ? 'var(--color-brand)'
            : 'var(--border-subtle)';
          const circleColor = isPassed || isCurrent ? '#ffffff' : 'var(--text-muted)';
          const lineColor = isPassed ? 'var(--color-success)' : 'var(--border-subtle)';

          const stepStatusText = isPassed ? 'Completed' : isCurrent ? 'Current step' : 'Upcoming';

          return (
            <div
              key={stage.key}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                paddingBottom: idx === FULFILLMENT_STAGES.length - 1 ? '0' : 'var(--space-4)',
              }}
            >
              {/* Vertical connecting line */}
              {idx < FULFILLMENT_STAGES.length - 1 && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '30px',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: lineColor,
                    zIndex: 1,
                  }}
                />
              )}

              {/* Status Circle Indicator */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: circleBg,
                  color: circleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  zIndex: 2,
                  flexShrink: 0,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(255, 90, 95, 0.2)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                aria-hidden="true"
              >
                {isPassed ? '✓' : stage.icon}
              </div>

              {/* Content / Timestamps */}
              <div style={{ marginLeft: 'var(--space-3)', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                  <span
                    style={{
                      fontWeight: isCurrent ? 700 : isPassed ? 600 : 500,
                      color: isUpcoming ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize: '0.95rem',
                    }}
                  >
                    <span className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                      {stepStatusText}:{' '}
                    </span>
                    {stage.label}
                    {isCurrent && (
                      <span
                        style={{
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-brand)',
                          color: '#ffffff',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        Current
                      </span>
                    )}
                  </span>


                  {timestamp && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {timestamp.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.825rem',
                    color: isUpcoming ? 'var(--text-muted)' : 'var(--text-secondary)',
                    marginTop: '2px',
                  }}
                >
                  {note || stage.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
