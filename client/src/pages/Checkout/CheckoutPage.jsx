import React, { useState, useEffect, useMemo } from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardHeader, CardBody, Button, Typography, StatusBadge } from '../../components/common';
import { Spinner } from '../../components/feedback/Spinner.jsx';
import { AuthoritativeQuoteReview } from './AuthoritativeQuoteReview.jsx';
import { PaymentMethodSelector } from './PaymentMethodSelector.jsx';
import { PaymentQrPresenter } from './PaymentQrPresenter.jsx';
import { PaymentInstructionNotice } from './PaymentInstructionNotice.jsx';
import { TransactionCodeInput } from './TransactionCodeInput.jsx';
import { PaymentProofUploader } from './PaymentProofUploader.jsx';
import { AddressSelector } from './AddressSelector.jsx';
import { DeliveryAddressReview } from './DeliveryAddressReview.jsx';
import { PaymentSummaryCard } from './PaymentSummaryCard.jsx';
import { PaymentConfirmationCard } from './PaymentConfirmationCard.jsx';
import { productRequestService } from '../../services/productRequest.service.js';
import { orderService } from '../../services/order.service.js';
import { paymentService } from '../../services/payment.service.js';
import { addressService } from '../../services/address.service.js';
import { calculateAuthoritativePaymentBreakdown, PAYMENT_MODES } from '../../utils/paymentCalculations.js';
import { validatePaymentProofFile } from '../../utils/fileValidation.js';

/**
 * SajiloMarts Checkout & Payment Proof Experience
 * Step-by-step customer checkout: Quote Review -> Payment Method -> Instructions & QR -> Proof Upload -> Address -> Submit
 */
export const CheckoutPage = ({
  orderId,
  requestId,
  user,
  onNavigate = () => {},
  onPaymentSubmitted,
  onBack,
}) => {
  const [order, setOrder] = useState(null);
  const [request, setRequest] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(orderId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const [transactionCode, setTransactionCode] = useState('');
  const [transactionCodeError, setTransactionCodeError] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofFileError, setProofFileError] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [allAddresses, setAllAddresses] = useState([]);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Load Order or Request Details
  useEffect(() => {
    const targetOrderId = orderId || activeOrderId;
    const targetRequestId = requestId;

    if (!targetOrderId && !targetRequestId) {
      setError('No order or sourcing request reference found for payment.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        if (targetOrderId) {
          const res = await orderService.getOrderDetail(targetOrderId);
          if (!isMounted) return;
          const orderData = res.data || res;
          setOrder(orderData);
          const resolvedId = orderData._id || orderData.id;
          setActiveOrderId(resolvedId);
          if (typeof window !== 'undefined' && resolvedId) {
            window.history.replaceState(null, '', `?view=checkout&orderId=${resolvedId}`);
          }
          // Construct request view model from authoritative order
          setRequest({
            _id: orderData.productRequest?._id || orderData.productRequest || orderData._id,
            id: orderData._id,
            orderId: orderData._id,
            orderNumber: orderData.orderNumber,
            productName: orderData.productName,
            productUrl: orderData.productUrl,
            marketplace: orderData.marketplace,
            quantity: orderData.quantity,
            variant: orderData.variant,
            notes: orderData.customerNotes,
            productPriceInr: orderData.productPriceInr,
            quote: orderData.quoteSnapshot || {
              productPriceInr: orderData.productPriceInr,
              quantity: orderData.quantity,
              subtotalInr: orderData.subtotalInr,
              conversionMultiplier: orderData.conversionMultiplier,
              feeRate: orderData.feeRate,
              convertedAmountNpr: orderData.convertedAmountNpr,
              finalAmountNpr: orderData.finalAmountNpr,
              paymentMode: orderData.paymentMode,
              amountPayableNow: orderData.amountPayableNow,
              payNowAmountNpr: orderData.amountPayableNow,
              remainingCodAmount: orderData.remainingCodAmount,
              remainingCodAmountNpr: orderData.remainingCodAmount,
            },
            deliveryAddress: orderData.deliveryAddressSnapshot,
            payment: orderData.payment,
          });

          if (orderData.deliveryAddressSnapshot) {
            setSelectedAddress(orderData.deliveryAddressSnapshot);
          }
          if (orderData.paymentMode === 'cod_50_50') {
            setSelectedMethod('cod_50_50');
          }
        } else if (targetRequestId) {
          const res = await productRequestService.getRequestDetails(targetRequestId);
          if (!isMounted) return;
          const reqData = res.data || res;
          setRequest(reqData);
          if (reqData.order) {
            setActiveOrderId(reqData.order._id || reqData.order);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load order details for payment.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [orderId, requestId, activeOrderId]);

  // Load User Addresses
  useEffect(() => {
    addressService.getAddresses()
      .then((res) => {
        const addrList = res?.data || res || [];
        const validList = Array.isArray(addrList) ? addrList : [];
        setAllAddresses(validList);
        if (validList.length > 0 && !selectedAddressId) {
          const defaultAddr = validList.find((a) => a.isDefaultShipping) || validList[0];
          setSelectedAddressId(defaultAddr._id || defaultAddr.id);
          setSelectedAddress(defaultAddr);
        }
      })
      .catch(() => {});
  }, []);

  // Update selected address object when selectedAddressId changes
  useEffect(() => {
    if (selectedAddressId && allAddresses.length > 0) {
      const found = allAddresses.find((a) => (a._id || a.id) === selectedAddressId);
      if (found) setSelectedAddress(found);
    }
  }, [selectedAddressId, allAddresses]);

  // Derive payment mode and authoritative calculation breakdown
  const paymentMode = useMemo(() => {
    return selectedMethod === 'cod_50_50' ? PAYMENT_MODES.COD_50_50 : PAYMENT_MODES.FULL_ONLINE;
  }, [selectedMethod]);

  const breakdown = useMemo(() => {
    if (!request) return null;
    if (order && order.quoteSnapshot) {
      const q = order.quoteSnapshot;
      return {
        productPriceInr: order.productPriceInr || q.productPriceInr,
        quantity: order.quantity || q.quantity,
        subtotalInr: order.subtotalInr ?? q.subtotalInr,
        conversionMultiplier: order.conversionMultiplier || q.conversionMultiplier || 1.65,
        feeRate: order.feeRate || q.feeRate || 0.12,
        convertedAmountNpr: order.convertedAmountNpr ?? q.convertedAmountNpr,
        finalAmountNpr: order.finalAmountNpr ?? q.finalAmountNpr,
        payNowAmountNpr: selectedMethod === 'cod_50_50' ? (order.amountPayableNow ?? q.payNowAmountNpr ?? Math.ceil((order.finalAmountNpr ?? q.finalAmountNpr) / 2)) : (order.finalAmountNpr ?? q.finalAmountNpr),
        remainingCodAmountNpr: selectedMethod === 'cod_50_50' ? (order.remainingCodAmount ?? q.remainingCodAmountNpr ?? Math.floor((order.finalAmountNpr ?? q.finalAmountNpr) / 2)) : 0,
        paymentMode,
      };
    }
    return calculateAuthoritativePaymentBreakdown(
      request.productPriceInr,
      request.quantity,
      paymentMode
    );
  }, [request, order, paymentMode, selectedMethod]);

  // Handle Payment Method switch (clears method-specific stale error state)
  const handleMethodChange = (newMethod) => {
    setSelectedMethod(newMethod);
    setTransactionCodeError(null);
  };

  // Handle Proof File selection
  const handleFileSelect = (file) => {
    const validation = validatePaymentProofFile(file);
    if (!validation.isValid) {
      setProofFileError(validation.error);
      setProofFile(null);
      return;
    }
    setProofFile(file);
    setProofFileError(null);
  };

  const handleFileRemove = () => {
    setProofFile(null);
    setProofFileError(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent double-clicks

    setSubmissionError(null);
    let hasClientErrors = false;

    // Validate transaction code
    const trimmedTxnCode = transactionCode.trim();
    if (!trimmedTxnCode) {
      setTransactionCodeError('Transaction / Reference code is required');
      hasClientErrors = true;
    } else if (trimmedTxnCode.length < 3) {
      setTransactionCodeError('Transaction code must be at least 3 characters');
      hasClientErrors = true;
    } else {
      setTransactionCodeError(null);
    }

    // Validate payment proof file
    if (!proofFile) {
      setProofFileError('Please attach a screenshot or image of your payment receipt');
      hasClientErrors = true;
    } else {
      setProofFileError(null);
    }

    // Validate address
    if (!selectedAddressId) {
      setSubmissionError('Please select or add a delivery address in Nepal.');
      hasClientErrors = true;
    }

    if (hasClientErrors) return;

    // Derived eligibility flags
    const rawPaymentStatus = order?.payment?.paymentStatus || request?.paymentSubmission?.paymentStatus || request?.payment?.paymentStatus;
    const isAlreadyPaid = rawPaymentStatus === 'verified' || rawPaymentStatus === 'paid';
    if (isAlreadyPaid) {
      setSubmissionError('Payment for this order has already been completed and verified.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Initialize Authoritative Payment Record on Server
      const initResponse = await paymentService.initializePayment({
        requestId: request._id || request.id,
        paymentMode,
        paymentMethod: selectedMethod,
      });

      const paymentRecord = initResponse?.data || initResponse;
      const paymentId = paymentRecord._id || paymentRecord.id;

      // Step 2: Submit Payment Proof & Transaction Code
      const proofResponse = await paymentService.submitPaymentProof(paymentId, {
        transactionCode: trimmedTxnCode,
        paymentProof: proofFile,
      });

      const updatedPayment = proofResponse?.data || proofResponse;
      setSubmissionResult(updatedPayment || paymentRecord);

      if (onPaymentSubmitted) {
        onPaymentSubmitted(updatedPayment || paymentRecord);
      }
    } catch (err) {
      setSubmissionError(err.message || 'Payment submission failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container size="narrow" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <Spinner size="lg" />
        <Typography variant="body" style={{ marginTop: 'var(--space-4)', color: 'var(--text-secondary)' }}>
          Retrieving authoritative quote and payment parameters...
        </Typography>
      </Container>
    );
  }

  if (error || !request) {
    return (
      <Container size="narrow" style={{ padding: 'var(--space-8) 0' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>⚠️</div>
          <Typography variant="h2" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
            Payment Details Unavailable
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            {error || 'Unable to retrieve authoritative order details for payment.'}
          </Typography>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                const targetId = orderId || activeOrderId || requestId;
                if (targetId) {
                  if (orderId || activeOrderId) {
                    orderService.getOrderDetail(orderId || activeOrderId)
                      .then((res) => {
                        const orderData = res.data || res;
                        setOrder(orderData);
                        setRequest({
                          _id: orderData.productRequest?._id || orderData.productRequest || orderData._id,
                          id: orderData._id,
                          orderId: orderData._id,
                          orderNumber: orderData.orderNumber,
                          productName: orderData.productName,
                          productUrl: orderData.productUrl,
                          marketplace: orderData.marketplace,
                          quantity: orderData.quantity,
                          variant: orderData.variant,
                          notes: orderData.customerNotes,
                          productPriceInr: orderData.productPriceInr,
                          quote: orderData.quoteSnapshot,
                          deliveryAddress: orderData.deliveryAddressSnapshot,
                          payment: orderData.payment,
                        });
                      })
                      .catch((err) => setError(err.message || 'Failed to reload payment details.'))
                      .finally(() => setIsLoading(false));
                  }
                }
              }}
            >
              🔄 Retry Loading
            </Button>
            <Button variant="primary" onClick={() => onNavigate('current-orders')}>
              View Current Orders
            </Button>
            <Button variant="ghost" onClick={() => onNavigate('sourcing-requests')}>
              &larr; Return to Sourcing Requests
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // If already verified / completed, show completed state
  const currentPaymentStatus = order?.payment?.paymentStatus || request?.payment?.paymentStatus || request?.paymentSubmission?.paymentStatus;
  if (currentPaymentStatus === 'verified' || currentPaymentStatus === 'paid') {
    return (
      <div className="checkout-page" id="sajilomarts-checkout-completed">
        <Section size="md">
          <Container size="narrow">
            <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🎉</div>
              <Typography variant="h2" style={{ color: 'var(--color-success)', marginBottom: 'var(--space-2)' }}>
                Payment Already Verified
              </Typography>
              <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Payment for this order has already been completed and confirmed. Your order is actively being processed by the Kathmandu fulfillment team.
              </Typography>
              {order?.orderNumber && (
                <div style={{ background: 'var(--bg-surface-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', display: 'inline-block' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Reference</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-brand)' }}>{order.orderNumber}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={() => onNavigate('current-orders')}>
                  View Active Orders
                </Button>
                <Button variant="outline" onClick={() => onNavigate('home')}>
                  Return to Homepage
                </Button>
              </div>
            </Card>
          </Container>
        </Section>
      </div>
    );
  }

  // If payment proof is currently under review / pending verification
  if (currentPaymentStatus === 'proof_submitted' || currentPaymentStatus === 'under_review') {
    const paymentData = order?.payment || request?.payment || request?.paymentSubmission;
    return (
      <div className="checkout-page" id="sajilomarts-checkout-verification">
        <Section size="md">
          <Container size="narrow">
            <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>⏳</div>
              <Typography variant="h2" style={{ color: 'var(--color-warning)', marginBottom: 'var(--space-2)' }}>
                Payment Proof Under Verification
              </Typography>
              <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Your payment reference has been submitted and is currently being verified by our Kathmandu finance desk. Verification typically completes within 15-30 minutes during business hours.
              </Typography>
              <div style={{ background: 'var(--bg-surface-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', textAlign: 'left', display: 'grid', gap: '8px' }}>
                {order?.orderNumber && (
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Order Reference: </span><strong>{order.orderNumber}</strong></div>
                )}
                {paymentData?.transactionCode && (
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Transaction Code: </span><code>{paymentData.transactionCode}</code></div>
                )}
                {paymentData?.paymentMethod && (
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Method: </span><strong style={{ textTransform: 'capitalize' }}>{paymentData.paymentMethod}</strong></div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={() => onNavigate('current-orders')}>
                  Go to Current Orders
                </Button>
                <Button variant="outline" onClick={() => onNavigate('sourcing-requests')}>
                  Return to Sourcing Requests
                </Button>
              </div>
            </Card>
          </Container>
        </Section>
      </div>
    );
  }

  // If already successfully submitted, show clean confirmation card
  if (submissionResult) {
    return (
      <div className="checkout-page" id="sajilomarts-checkout-confirmation">
        <Section size="md">
          <Container size="narrow">
            <PaymentConfirmationCard
              submission={submissionResult}
              request={request}
              onViewRequests={() => onNavigate('sourcing-requests')}
              onGoHome={() => onNavigate('home')}
            />
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <div className="checkout-page" id="sajilomarts-checkout">
      <Section size="md">
        <Container size="standard">
          <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 700 }}>
                  Step 2 of 2: Checkout &amp; Payment
                </span>
                {order?.orderNumber && (
                  <StatusBadge status="info" label={`Order: ${order.orderNumber}`} />
                )}
              </div>
              <Typography variant="h1" style={{ marginTop: 'var(--space-1)', fontSize: '1.75rem' }}>
                Confirm Quote &amp; Submit Payment Proof
              </Typography>
            </div>
            <Button variant="ghost" size="sm" onClick={onBack || (() => onNavigate('sourcing-requests'))}>
              &larr; Back to Requests
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--space-6)' }}>
            {/* 1. Authoritative Quote Breakdown */}
            <AuthoritativeQuoteReview request={request} />

            {/* 2. Payment Method Selector */}
            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onSelectMethod={handleMethodChange}
              disabled={isSubmitting}
            />

            {/* 3. Dynamic QR Presentation & Instructions */}
            <PaymentQrPresenter
              selectedMethod={selectedMethod}
              breakdown={breakdown}
            />

            {/* 4. Payment Instruction Notice */}
            <PaymentInstructionNotice selectedMethod={selectedMethod} />

            {/* 5. Transaction Code Input */}
            <TransactionCodeInput
              value={transactionCode}
              onChange={setTransactionCode}
              error={transactionCodeError}
              selectedMethod={selectedMethod}
              disabled={isSubmitting}
            />

            {/* 6. Payment Proof Screenshot Upload */}
            <PaymentProofUploader
              file={proofFile}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              error={proofFileError}
              disabled={isSubmitting}
            />

            {/* 7. Nepal Delivery Address Selection */}
            <AddressSelector
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              disabled={isSubmitting}
            />

            {/* 8. Delivery Address Review */}
            {selectedAddress && (
              <DeliveryAddressReview address={selectedAddress} />
            )}

            {/* 9. Payment Summary Card */}
            {breakdown && (
              <PaymentSummaryCard
                quote={breakdown}
                paymentMode={paymentMode}
                paymentMethod={selectedMethod}
              />
            )}

            {/* Error banner if submission failed */}
            {submissionError && (
              <div
                role="alert"
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1.5px solid var(--color-error)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-error)',
                  fontSize: '0.9rem',
                }}
              >
                ⚠️ {submissionError}
              </div>
            )}

            {/* 10. Final Submission Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                aria-disabled={isSubmitting}
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Submitting Payment Proof...</span>
                  </>
                ) : (
                  <span>Submit Payment for Verification</span>
                )}
              </Button>
              <Typography variant="caption" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                🔒 Your transaction reference and proof are securely submitted to the SajiloMarts fulfillment team for verification.
              </Typography>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default CheckoutPage;
