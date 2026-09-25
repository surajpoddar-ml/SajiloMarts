import React from 'react';
import { Logo } from '../common/Logo.jsx';
import { Container } from './Container.jsx';

/**
 * SastoMarts Professional Application Footer & Legal Navigation
 */
export const Footer = ({
  brandName = 'SastoMarts',
  onNavigate = () => {},
}) => {
  return (
    <footer className="site-footer">
      <Container size="wide">
        <div className="footer-grid">
          {/* Brand Col */}
          <div>
            <div className="footer-brand__title" style={{ marginBottom: '12px' }}>
              <Logo
                size="footer"
                onClick={() => onNavigate('home')}
              />
            </div>
            <div className="footer-brand__tagline">Shop from India. We Deliver to Nepal.</div>
            <p className="footer-brand__desc">
              Dedicated cross-border product sourcing and verified courier logistics connecting Indian marketplaces to customers across Nepal.
            </p>
          </div>

          {/* Sourcing Col */}
          <div>
            <div className="footer-column__title">Sourcing</div>
            <ul className="footer-column__list">
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('sourcing-requests')}>
                  Sourcing Portal
                </button>
              </li>
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('sourcing-new')}>
                  Submit Product URL
                </button>
              </li>
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('how-it-works')}>
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care Col */}
          <div>
            <div className="footer-column__title">Customer Care</div>
            <ul className="footer-column__list">
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('track-order')}>
                  Track Order
                </button>
              </li>
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('account')}>
                  Customer Account
                </button>
              </li>
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('support')}>
                  Help &amp; Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Col */}
          <div>
            <div className="footer-column__title">Legal &amp; Policies</div>
            <ul className="footer-column__list">
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('terms')}>
                  Terms of Service <span className="footer-draft-note">(Draft)</span>
                </button>
              </li>
              <li>
                <button type="button" className="footer-link" onClick={() => onNavigate('privacy')}>
                  Privacy Policy <span className="footer-draft-note">(Draft)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved. Nepal &bull; India Cross-Border Logistics.
          </div>
          <div className="footer-draft-note">
            Legal &amp; Compliance documentation marked as Draft for stakeholder review.
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
