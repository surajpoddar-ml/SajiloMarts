import { useState, useEffect } from 'react';
import { productRequestService, quoteService } from '../../services';

const SUPPORTED_MARKETPLACES_LIST = [
  'Amazon India (amazon.in)',
  'Flipkart (flipkart.com)',
  'Myntra (myntra.com)',
  'Meesho (meesho.com)',
  'Nykaa (nykaa.com)',
  'Tata 1mg (1mg.com)',
  'Ajio (ajio.com)',
];

export function SourcingRequestForm({ onRequestCreated, onCancel }) {
  const [formData, setFormData] = useState({
    productUrl: '',
    productName: '',
    productPriceInr: '',
    quantity: 1,
    variant: '',
    notes: '',
    paymentMode: 'online_100',
  });

  const [detectedMarketplace, setDetectedMarketplace] = useState('');
  const [quotePreview, setQuotePreview] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-detect marketplace hint from URL
  useEffect(() => {
    const url = formData.productUrl.toLowerCase();
    if (url.includes('amazon.')) setDetectedMarketplace('Amazon India');
    else if (url.includes('flipkart.')) setDetectedMarketplace('Flipkart');
    else if (url.includes('myntra.')) setDetectedMarketplace('Myntra');
    else if (url.includes('meesho.')) setDetectedMarketplace('Meesho');
    else if (url.includes('nykaa.')) setDetectedMarketplace('Nykaa');
    else if (url.includes('1mg.')) setDetectedMarketplace('Tata 1mg');
    else if (url.includes('ajio.')) setDetectedMarketplace('Ajio');
    else if (url.length > 5) setDetectedMarketplace('Other Indian Marketplace');
    else setDetectedMarketplace('');
  }, [formData.productUrl]);

  // Request authoritative live quote from backend
  const fetchLiveQuote = async () => {
    const price = parseFloat(formData.productPriceInr);
    const qty = parseInt(formData.quantity, 10);
    if (!price || price <= 0 || !qty || qty <= 0) {
      setQuotePreview(null);
      return;
    }

    setLoadingQuote(true);
    setError(null);
    try {
      const res = await quoteService.calculateQuote({
        productPriceInr: price,
        quantity: qty,
        paymentMode: formData.paymentMode,
      });
      setQuotePreview(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to calculate quote');
      setQuotePreview(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.productPriceInr && Number(formData.productPriceInr) > 0) {
        fetchLiveQuote();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.productPriceInr, formData.quantity, formData.paymentMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    // Pre-validate
    if (!formData.productUrl || !formData.productUrl.trim()) {
      setError('Please provide a valid Indian marketplace product link.');
      return;
    }

    if (!formData.productName || formData.productName.trim().length < 2) {
      setError('Product title must be at least 2 characters long.');
      return;
    }

    const price = parseFloat(formData.productPriceInr);
    if (!price || price <= 0 || isNaN(price)) {
      setError('Indian product price in INR must be a valid number greater than ₹0.');
      return;
    }

    const qty = parseInt(formData.quantity, 10);
    if (!qty || qty < 1 || isNaN(qty)) {
      setError('Quantity must be at least 1 item.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        productUrl: formData.productUrl.trim(),
        productName: formData.productName.trim(),
        productPriceInr: price,
        quantity: qty,
        variant: formData.variant.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        paymentMode: formData.paymentMode,
      };

      const res = await productRequestService.createRequest(payload);
      setSuccessMsg('Sourcing request created successfully!');
      if (onRequestCreated) {
        onRequestCreated(res.data || res);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit sourcing request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1.5rem auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>Submit Indian Sourcing Request</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Paste the product link from any supported Indian store. We handle purchasing, import, and doorstep delivery to Nepal.
      </p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          &check; {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#334155' }}>
            Product URL (Indian Marketplace) *
          </label>
          <input
            type="url"
            name="productUrl"
            required
            placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/..."
            value={formData.productUrl}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
          />
          {detectedMarketplace && (
            <small style={{ color: '#2563eb', fontWeight: 500, display: 'block', marginTop: '0.25rem' }}>
              &bull; Detected: {detectedMarketplace}
            </small>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#334155' }}>
            Product Name / Title *
          </label>
          <input
            type="text"
            name="productName"
            required
            placeholder="e.g. Boat Rockerz 450 Bluetooth Headphones"
            value={formData.productName}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#334155' }}>
              Price in India (INR ₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="productPriceInr"
              required
              placeholder="e.g. 1499.00"
              value={formData.productPriceInr}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#334155' }}>
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              name="quantity"
              required
              value={formData.quantity}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#334155' }}>
            Payment Mode *
          </label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#ffffff' }}
          >
            <option value="online_100">100% Online Payment (18% Service &amp; Surcharge Fee)</option>
            <option value="cod_50_50">50% Online / 50% Cash on Delivery (22% Surcharge Fee)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#334155' }}>
            Variant / Size / Color (Optional)
          </label>
          <input
            type="text"
            name="variant"
            placeholder="e.g. Matte Black, Size L, 128GB"
            value={formData.variant}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#334155' }}>
            Special Sourcing Notes / Instructions (Optional)
          </label>
          <textarea
            name="notes"
            rows="2"
            placeholder="Any specific delivery instructions or seller preferences..."
            value={formData.notes}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
          />
        </div>

        {/* Live Server-Authoritative Quote Preview */}
        {quotePreview && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginTop: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', color: '#1e293b', fontSize: '1rem' }}>
              &check; Server-Authoritative Price Quote
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
              <div>INR Subtotal: <strong>₹{quotePreview.subtotalInr || quotePreview.sourceSubtotalInr}</strong></div>
              <div>Rate Multiplier: <strong>×{quotePreview.conversionMultiplier || quotePreview.exchangeRate}</strong></div>
              <div>Converted NPR: <strong>NPR {quotePreview.convertedAmountNpr}</strong></div>
              <div>Service Fee: <strong>{((quotePreview.feeRate || quotePreview.appliedRate) * 100).toFixed(0)}%</strong></div>
              <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', gridColumn: 'span 2' }}>
                Final NPR Total: <span style={{ color: '#2563eb' }}>NPR {quotePreview.finalAmountNpr}</span>
              </div>
              <div>Pay Now: <strong style={{ color: '#16a34a' }}>NPR {quotePreview.amountPayableNow || quotePreview.payNowAmountNpr}</strong></div>
              <div>COD Remainder: <strong style={{ color: '#ea580c' }}>NPR {quotePreview.remainingCodAmount || quotePreview.remainingCodAmountNpr}</strong></div>
            </div>
            <small style={{ display: 'block', marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
              * Calculated server-side with deterministic rounding. Surcharge covers customs handling, cross-border courier &amp; import clearance.
            </small>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ flex: 1, padding: '0.75rem 1.5rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Submitting Sourcing Request...' : 'Submit Sourcing Request'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
