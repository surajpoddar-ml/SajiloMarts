import React from 'react';
import { Container, Section } from '../../components/layout';
import { Typography, Card, CardBody } from '../../components/common';
import { PUBLIC_CONFIG } from '../../config/public.js';
import { HeroSection } from './HeroSection.jsx';
import { ProductUrlForm } from './ProductUrlForm.jsx';
import { AuthContinuationPrompt } from './AuthContinuationPrompt.jsx';

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

  const handleUrlSubmit = (url) => {
    setProductUrl(url);
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

      {/* 2. Sourcing Portal / Request & Quote Flow Anchor */}
      <section id="sourcing-flow-section" aria-label="Sourcing Request and Server Quote Flow">
        {/* Established in upcoming commits */}
      </section>

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
