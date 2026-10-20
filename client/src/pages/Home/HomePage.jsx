import React from 'react';
import { HeroSection } from './HeroSection.jsx';
import { HowItWorksSection } from './HowItWorksSection.jsx';
import { SupportedMarketplacesSection } from './SupportedMarketplacesSection.jsx';
import { ServiceBenefitsSection } from './ServiceBenefitsSection.jsx';
import { TrackOrderSection } from './TrackOrderSection.jsx';
import { AccountEntrySection } from './AccountEntrySection.jsx';
import { SupportEntrySection } from './SupportEntrySection.jsx';

/**
 * SastoMarts Official Public Landing Page
 * Provides clear information on what the platform is, how cross-border sourcing works,
 * supported Indian marketplaces, logistics & customs, and tracking.
 * Interactive request creation is accessed inside the authenticated user portal.
 */
export function HomePage({
  onNavigate,
  user,
  isAuthenticated,
  onRequestCreated,
}) {
  return (
    <div className="homepage" id="sastomarts-homepage">
      {/* 1. Hero & Core Value Proposition Section */}
      <HeroSection
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated}
      />

      {/* 2. How SastoMarts Works: 5-Step Process */}
      <HowItWorksSection />

      {/* 3. Supported Indian Marketplaces & Categories */}
      <SupportedMarketplacesSection />

      {/* 4. Service Benefits & Trust Guarantees */}
      <ServiceBenefitsSection />

      {/* 5. Real-Time Order Tracking */}
      <TrackOrderSection onNavigate={onNavigate} />

      {/* 6. Customer Account & Sourcing Portal Access */}
      <AccountEntrySection onNavigate={onNavigate} />

      {/* 7. Support & Assistance Entry */}
      <SupportEntrySection onNavigate={onNavigate} />
    </div>
  );
}

export default HomePage;

