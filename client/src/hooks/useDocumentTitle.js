import { useEffect } from 'react';
import { PUBLIC_CONFIG } from '../config/public.js';

/**
 * useDocumentTitle
 * Sets the browser window/tab document title dynamically with consistent SastoMarts branding.
 */
export const useDocumentTitle = (title, currentView) => {
  useEffect(() => {
    const viewTitles = {
      'home': `${PUBLIC_CONFIG.BRAND_NAME} — Shop from India. We Deliver to Nepal.`,
      'sourcing-requests': `${PUBLIC_CONFIG.BRAND_NAME} — My Orders`,
      'sourcing-new': `${PUBLIC_CONFIG.BRAND_NAME} — Source a Product`,
      'sourcing-detail': `${PUBLIC_CONFIG.BRAND_NAME} — Request Details & Quote`,
      'track-order': `${PUBLIC_CONFIG.BRAND_NAME} — Track Order`,
      'account': `${PUBLIC_CONFIG.BRAND_NAME} — Customer Account`,
      'login': `${PUBLIC_CONFIG.BRAND_NAME} — Sign In`,
      'register': `${PUBLIC_CONFIG.BRAND_NAME} — Create Account`,
      'support': `${PUBLIC_CONFIG.BRAND_NAME} — Customer Support`,
      'how-it-works': `${PUBLIC_CONFIG.BRAND_NAME} — How It Works`,
      'terms': `${PUBLIC_CONFIG.BRAND_NAME} — Terms of Service`,
      'privacy': `${PUBLIC_CONFIG.BRAND_NAME} — Privacy Policy`,
      'admin-console': `${PUBLIC_CONFIG.BRAND_NAME} — Admin Console`,
      'checkout': `${PUBLIC_CONFIG.BRAND_NAME} — Secure Checkout & Payment Proof`,
    };

    if (currentView && viewTitles[currentView]) {
      document.title = viewTitles[currentView];
    } else if (title) {
      document.title = `${PUBLIC_CONFIG.BRAND_NAME} — ${title}`;
    } else {
      document.title = `${PUBLIC_CONFIG.BRAND_NAME} — ${PUBLIC_CONFIG.TAGLINE}`;
    }
  }, [title, currentView]);
};

export default useDocumentTitle;
