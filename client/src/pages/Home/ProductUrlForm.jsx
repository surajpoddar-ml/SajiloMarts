import React, { useState } from 'react';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { validateProductUrl } from '../../utils/formValidation.js';

/**
 * SastoMarts Product URL Sourcing Form
 * The main interactive entry point allowing customers to paste any Indian product link.
 */
export const ProductUrlForm = ({
  onSubmitUrl,
  isLoading = false,
  initialUrl = '',
  serverError = null,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [validationError, setValidationError] = useState(null);
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setTouched(true);

    const clientError = validateProductUrl(url);
    if (clientError) {
      setValidationError(clientError);
      return;
    }

    setValidationError(null);
    if (onSubmitUrl) {
      onSubmitUrl(url.trim());
    }
  };

  const handlePasteSample = (sampleDomain) => {
    const sampleUrls = {
      'amazon.in': 'https://www.amazon.in/dp/B0BDK62PDX',
      'flipkart.com': 'https://www.flipkart.com/apple-iphone-15/p/itm12345',
      'myntra.com': 'https://www.myntra.com/shoes/nike/12345',
      'meesho.com': 'https://www.meesho.com/s/p/12345',
      '1mg.com': 'https://www.1mg.com/otc/sample-product-otc123',
    };
    const sample = sampleUrls[sampleDomain];
    if (sample) {
      setUrl(sample);
      setValidationError(null);
      setTouched(true);
    }
  };

  return (
    <div className="product-url-form-container" style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: 'var(--bg-surface-secondary)',
          padding: '12px',
          borderRadius: 'var(--radius-lg)',
          border: validationError || serverError ? '1px solid var(--color-error-border)' : '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '0 12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginRight: '8px' }} aria-hidden="true">🔗</span>
              <input
                id="product-url-hero-input"
                name="productUrl"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (touched) {
                    setValidationError(validateProductUrl(e.target.value));
                  }
                }}
                onBlur={() => {
                  setTouched(true);
                  setValidationError(validateProductUrl(url));
                }}
                placeholder="Paste Indian product URL (e.g., https://www.amazon.in/...)"
                aria-label="Indian Product URL"
                aria-invalid={Boolean(validationError || serverError)}
                aria-describedby={validationError || serverError ? 'url-error-msg' : 'url-helper-msg'}
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '46px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                }}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setValidationError(null);
                  }}
                  aria-label="Clear URL input"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    padding: '4px',
                  }}
                >
                  &times;
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || !url.trim()}
              aria-busy={isLoading}
              style={{ flex: '0 0 auto', minWidth: '160px' }}
            >
              {isLoading ? 'Verifying URL...' : 'Verify & Get Quote'}
            </Button>
          </div>

          {/* State Feedback: Loading, Verified Marketplace, or Error Banner */}
          {isLoading && (
            <div
              role="status"
              aria-live="polite"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="spinner spinner--sm" aria-hidden="true" />
              <span>Verifying product URL with SastoMarts backend...</span>
            </div>
          )}

          {/* Inline Error Message */}
          {(validationError || serverError) && (
            <div
              id="url-error-msg"
              role="alert"
              style={{
                color: 'var(--color-error)',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.85rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderLeft: '3px solid var(--color-error)',
              }}
            >
              <span aria-hidden="true">⚠️</span>
              <span>{validationError || serverError}</span>
            </div>
          )}

          {/* Supported Marketplaces Hint */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
            <span id="url-helper-msg" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Supported: Amazon.in &bull; Flipkart &bull; Myntra &bull; Meesho &bull; Tata 1mg
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['amazon.in', 'flipkart.com', 'myntra.com'].map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => handlePasteSample(domain)}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: 'var(--color-brand)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    padding: '2px 4px',
                    textDecoration: 'underline',
                  }}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductUrlForm;
