import { useEffect } from 'react';
import { PUBLIC_CONFIG } from '../config/public.js';

/**
 * useDocumentTitle
 * Sets the browser window/tab document title dynamically with consistent SajiloMarts branding.
 */
export const useDocumentTitle = (title, currentView) => {
  useEffect(() => {
    const viewTitles = {
      'home': `${PUBLIC_CONFIG.BRAND_NAME} — Shop from India. We Deliver to Nepal.`,
      'sourcing-requests': `${PUBLIC_CONFIG.BRAND_NAME} — Sourcing Requests`,
      'sourcing-new': `${PUBLIC_CONFIG.BRAND_NAME} — Source a Product`,
      'sourcing-detail': `${PUBLIC_CONFIG.BRAND_NAME} — Request Details & Quote`,
      'current-orders': `${PUBLIC_CONFIG.BRAND_NAME} — Current Orders`,
      'order-history': `${PUBLIC_CONFIG.BRAND_NAME} — Order History`,
      'order-detail': `${PUBLIC_CONFIG.BRAND_NAME} — Order Details`,
      'addresses': `${PUBLIC_CONFIG.BRAND_NAME} — Delivery Addresses`,
      'account-security': `${PUBLIC_CONFIG.BRAND_NAME} — Account Security`,
      'track-order': `${PUBLIC_CONFIG.BRAND_NAME} — Track Order`,
      'account': `${PUBLIC_CONFIG.BRAND_NAME} — Customer Account Portal`,
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
