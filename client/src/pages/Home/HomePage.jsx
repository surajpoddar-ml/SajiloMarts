import React from 'react';
import { Container, Section } from '../../components/layout';
import { Typography, Card, CardBody } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';
import { HeroSection } from './HeroSection.jsx';
import { ProductUrlForm } from './ProductUrlForm.jsx';
import { AuthContinuationPrompt } from './AuthContinuationPrompt.jsx';
import { SourcingPortalSection } from './SourcingPortalSection.jsx';
import { SourcingRequestInteractiveForm } from './SourcingRequestInteractiveForm.jsx';

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
