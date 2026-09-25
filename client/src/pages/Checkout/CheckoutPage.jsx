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
import { paymentService } from '../../services/payment.service.js';
import { addressService } from '../../services/address.service.js';
import { calculateAuthoritativePaymentBreakdown, PAYMENT_MODES } from '../../utils/paymentCalculations.js';
import { validatePaymentProofFile } from '../../utils/fileValidation.js';

/**
 * SajiloMarts Checkout & Payment Proof Experience
 * Step-by-step customer checkout: Quote Review -> Payment Method -> Instructions & QR -> Proof Upload -> Address -> Submit
 */
export const CheckoutPage = ({
  requestId,
  user,
  onNavigate = () => {},
  onPaymentSubmitted,
  onBack,
}) => {
  const [request, setRequest] = useState(null);
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

  // Load Request Details
  useEffect(() => {
    if (!requestId) {
      setError('No sourcing request selected for checkout.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    productRequestService.getRequestDetails(requestId)
      .then((res) => {
        if (isMounted) {
          const reqData = res.data || res;
          setRequest(reqData);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load sourcing request for checkout.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestId]);

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
    return calculateAuthoritativePaymentBreakdown(
      request.productPriceInr,
      request.quantity,
      paymentMode
    );
  }, [request, paymentMode]);

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
          <Typography variant="h2" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
            Checkout Unavailable
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            {error || 'Unable to retrieve sourcing request for checkout.'}
          </Typography>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Button variant="outline" onClick={() => onNavigate('sourcing-requests')}>
              &larr; Return to Sourcing Requests
            </Button>
            <Button variant="primary" onClick={() => onNavigate('home')}>
              Go to Homepage
            </Button>
          </div>
        </Card>
      </Container>
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
              <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
                Step 2 of 2: Checkout &amp; Payment Proof
              </Typography>
              <Typography variant="h1" style={{ marginTop: 'var(--space-1)', fontSize: '1.75rem' }}>
                Confirm Quote &amp; Submit Payment
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
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 600 }}
              >
                {isSubmitting ? 'Submitting Payment Proof...' : 'Submit Payment for Verification'}
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
