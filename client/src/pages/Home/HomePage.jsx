import React from 'react';
import { Container, Section } from '../../components/layout';
import { Typography, Card, CardBody } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';
import { HeroSection } from './HeroSection.jsx';
import { ProductUrlForm } from './ProductUrlForm.jsx';
import { AuthContinuationPrompt } from './AuthContinuationPrompt.jsx';
import { SourcingPortalSection } from './SourcingPortalSection.jsx';
import { SourcingRequestInteractiveForm } from './SourcingRequestInteractiveForm.jsx';
import { RequestReviewCard } from './RequestReviewCard.jsx';
import { ServerQuoteDisplay } from './ServerQuoteDisplay.jsx';
import { productRequestService } from '../../services/productRequest.service.js';

export function HomePage({
  onNavigate,
  user,
  isAuthenticated,
  onRequestCreated,
  onTrackOrder,
}) {
  const [productUrl, setProductUrl] = React.useState('');
  const [isUrlValidating, setIsUrlValidating] = React.useState(false);
  const [urlError, setUrlError] = React.useState(null);
  const [activeStep, setActiveStep] = React.useState('form'); // 'form' | 'review' | 'quote'
  const [requestDraft, setRequestDraft] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState(null);
  const [createdRequest, setCreatedRequest] = React.useState(null);

  const handleUrlSubmit = (url) => {
    setProductUrl(url);
    const portalEl = document.getElementById('sourcing-portal');
    if (portalEl) {
      portalEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReviewStep = (draft) => {
    setRequestDraft(draft);
    setActiveStep('review');
    setSubmissionError(null);
  };

  const handleSubmitRequest = async () => {
    if (!requestDraft) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        productUrl: requestDraft.productUrl,
        productName: requestDraft.productName,
        quantity: requestDraft.quantity || 1,
      };

      if (requestDraft.variant) payload.variant = requestDraft.variant;
      if (requestDraft.notes) payload.notes = requestDraft.notes;
      if (requestDraft.productPriceInr) {
        payload.productPriceInr = Number(requestDraft.productPriceInr);
      }

      const response = await productRequestService.createRequest(payload);
      const reqData = response.data || response;
      setCreatedRequest(reqData);
      setActiveStep('quote');

      if (onRequestCreated) {
        onRequestCreated(reqData);
      }
    } catch (err) {
      setSubmissionError(err.message || 'Failed to create sourcing request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="homepage" id="sastomarts-homepage">
      {/* 1. Hero / Product URL Sourcing Section */}
      <HeroSection>
        <ProductUrlForm
          onSubmitUrl={handleUrlSubmit}
          isLoading={isUrlValidating}
          initialUrl={productUrl}
          serverError={urlError}
        />
      </HeroSection>

      {/* 2. Sourcing Portal Layout Section */}
      <SourcingPortalSection
        initialProductUrl={productUrl}
        user={user}
        isAuthenticated={isAuthenticated}
        onNavigate={onNavigate}
        onRequestCreated={onRequestCreated}
      >
        {activeStep === 'form' && (
          <SourcingRequestInteractiveForm
            initialProductUrl={productUrl}
            onSubmitReview={handleReviewStep}
          />
        )}

        {activeStep === 'review' && (
          <RequestReviewCard
            requestData={requestDraft}
            onEdit={() => setActiveStep('form')}
            onSubmit={handleSubmitRequest}
            isSubmitting={isSubmitting}
            error={submissionError}
            isAuthenticated={isAuthenticated}
            onLogin={() => onNavigate('login')}
            onRegister={() => onNavigate('register')}
          />
        )}

        {activeStep === 'quote' && createdRequest && (
          <ServerQuoteDisplay
            requestId={createdRequest._id || createdRequest.id}
            initialQuote={createdRequest.quote}
            onRequestConfirmed={(confirmedData) => {
              if (onRequestCreated) {
                onRequestCreated(confirmedData);
              }
            }}
            onReset={() => {
              setActiveStep('form');
              setRequestDraft(null);
              setCreatedRequest(null);
              setProductUrl('');
            }}
          />
        )}
      </SourcingPortalSection>

      {/* 3. How SastoMarts Works Section Anchor */}
      <section id="how-it-works-section" aria-label="How SastoMarts Works">
        {/* Established in upcoming commits */}
      </section>

      {/* 4. Supported Marketplaces Section Anchor */}
      <section id="supported-marketplaces-section" aria-label="Supported Indian Marketplaces">
        {/* Established in upcoming commits */}
      </section>

      {/* 5. Service Benefits Section Anchor */}
      <section id="service-benefits-section" aria-label="Service Benefits">
        {/* Established in upcoming commits */}
      </section>

      {/* 6. Real Track Order Entry Section Anchor */}
      <section id="track-order-section" aria-label="Track Cross-Border Order">
        {/* Established in upcoming commits */}
      </section>

      {/* 7. Customer Account & Support Entry Section Anchor */}
      <section id="account-support-section" aria-label="Account and Support Access">
        {/* Established in upcoming commits */}
      </section>
    </div>
  );
}

export default HomePage;
