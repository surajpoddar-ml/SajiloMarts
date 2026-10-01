import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { PAYMENT_STATUSES } from '../constants/payment.constants.js';
import { ORDER_STATUSES } from '../constants/order.constants.js';
import { recordSecurityEvent } from '../utils/securityAudit.js';

/**
 * PaymentStateSync
 * Connects verified/failed payment states to order and product request lifecycle.
 * Called after payment verification succeeds or fails.
 *
 * Rules:
 * - Successful verification: update order status to ORDER_RECEIVED, request to PAYMENT_VERIFIED
 * - Failed/cancelled: reflect accurately without advancing order
 * - COD 50/50: online payment verified ≠ full order complete (remaining 50% due on delivery)
 */
export class PaymentStateSync {
  /**
   * Synchronizes a payment verification result to the associated order and request.
   * @param {object} payment - PaymentSubmission document
   * @returns {Promise<void>}
   */
  async syncPaymentStateToOrder(payment) {
    if (!payment) return;

    const { Order } = await import('../models/order.model.js');

    try {
      if (payment.paymentStatus === PAYMENT_STATUSES.VERIFIED) {
        // Update product request status
        await ProductRequest.findByIdAndUpdate(payment.productRequest, {
          status: REQUEST_STATUSES.PAYMENT_VERIFIED,
        });

        // Update order if it exists
        if (payment.order) {
          const order = await Order.findById(payment.order);
          if (order && order.status !== ORDER_STATUSES.CANCELLED) {
            // Only advance to ORDER_RECEIVED if currently in an earlier state
            if (!order.status || order.status === 'pending') {
              order.status = ORDER_STATUSES.ORDER_RECEIVED;
              order.statusHistory = order.statusHistory || [];
              order.statusHistory.push({
                status: ORDER_STATUSES.ORDER_RECEIVED,
                changedAt: new Date(),
                note: `Payment verified via ${payment.paymentMethod} (${payment.verificationSource || 'provider'})`,
              });
              await order.save();
            }
          }
        }

        recordSecurityEvent('PAYMENT_STATE_SYNCED', {
          userId: String(payment.user),
          success: true,
          reason: `Payment ${payment._id} verified -> order synced`,
        });
      } else if ([PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.CANCELLED, PAYMENT_STATUSES.EXPIRED].includes(payment.paymentStatus)) {
        // Failed payments: revert request to payment_pending
        await ProductRequest.findByIdAndUpdate(payment.productRequest, {
          status: REQUEST_STATUSES.PAYMENT_PENDING,
        });

        recordSecurityEvent('PAYMENT_STATE_SYNCED', {
          userId: String(payment.user),
          success: false,
          reason: `Payment ${payment._id} ${payment.paymentStatus} -> request reverted to payment_pending`,
        });
      }
    } catch (err) {
      // State sync errors are logged but don't fail the verification flow
      if (process.env.NODE_ENV !== 'test') {
        console.error(`[PaymentStateSync] Failed to sync payment state: ${err.message}`);
      }
    }
  }
}

export const paymentStateSync = new PaymentStateSync();
export default paymentStateSync;
