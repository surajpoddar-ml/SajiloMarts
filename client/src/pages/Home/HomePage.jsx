import React from 'react';
import { HeroSection } from './HeroSection.jsx';
import { ProductUrlForm } from './ProductUrlForm.jsx';
import { HowItWorksSection } from './HowItWorksSection.jsx';
import { SupportedMarketplacesSection } from './SupportedMarketplacesSection.jsx';
import { ServiceBenefitsSection } from './ServiceBenefitsSection.jsx';
import { TrackOrderSection } from './TrackOrderSection.jsx';
import { AccountEntrySection } from './AccountEntrySection.jsx';
import { SupportEntrySection } from './SupportEntrySection.jsx';

export function HomePage({
  onNavigate,
  user,
  isAuthenticated,
  onRequestCreated,
  onTrackOrder,
}) {
  const [productUrl, setProductUrl] = React.useState('');

  const handleUrlSubmit = (url) => {
    setProductUrl(url);
    if (onNavigate) {
      onNavigate('sourcing-new', url);
    }
  };

  return (
    <div className="homepage" id="sastomarts-homepage">
      {/* 1. Hero / Product URL Sourcing Entry Section */}
      <HeroSection>
        <ProductUrlForm
          onSubmitUrl={handleUrlSubmit}
          initialUrl={productUrl}
        />
      </HeroSection>

      {/* 2. How SastoMarts Works Section */}
      <HowItWorksSection />

      {/* 3. Supported Marketplaces Section */}
      <SupportedMarketplacesSection />

      {/* 4. Service Benefits Section */}
      <ServiceBenefitsSection />

      {/* 5. Real Track Order Entry Section */}
      <TrackOrderSection onTrackOrder={onTrackOrder} />

      {/* 6. Customer Account Entry Section */}
      <AccountEntrySection
        user={user}
        isAuthenticated={isAuthenticated}
        onNavigate={onNavigate}
      />

      {/* 7. Support Entry Section */}
      <SupportEntrySection onNavigate={onNavigate} />
    </div>
  );
}

export default HomePage;

