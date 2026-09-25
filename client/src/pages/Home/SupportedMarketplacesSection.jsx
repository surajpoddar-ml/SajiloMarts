import React from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardBody, Typography } from '../../components/common';

const SUPPORTED_MARKETPLACES = [
  {
    id: 'amazon',
    name: 'Amazon India',
    domain: 'amazon.in',
    category: 'Electronics, Books, Home, Essentials',
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    domain: 'flipkart.com',
    category: 'Mobiles, Gadgets, Appliances, Fashion',
  },
  {
    id: 'myntra',
    name: 'Myntra',
    domain: 'myntra.com',
    category: 'Fashion, Footwear, Apparel, Accessories',
  },
  {
    id: 'meesho',
    name: 'Meesho',
    domain: 'meesho.com',
    category: 'Affordable Fashion, Household, Lifestyle',
  },
  {
    id: '1mg',
    name: 'Tata 1mg',
    domain: '1mg.com',
    category: 'Health Supplements, Personal Care, OTC',
  },
  {
    id: 'ajio',
    name: 'AJIO',
    domain: 'ajio.com',
    category: 'Trends, Premium Brands, Footwear',
  },
  {
    id: 'nykaa',
    name: 'Nykaa',
    domain: 'nykaa.com',
    category: 'Beauty, Cosmetics, Skincare, Fragrances',
  },
  {
    id: 'tatacliq',
    name: 'Tata CLiQ',
    domain: 'tatacliq.com',
    category: 'Electronics, Luxury, Watches, Lifestyle',
  },
];

/**
 * SupportedMarketplacesSection
 * Factually presents the Indian e-commerce stores supported by SastoMarts sourcing API.
 * Note: SastoMarts is an independent cross-border courier and sourcing platform; no fake partnerships are claimed.
 */
export const SupportedMarketplacesSection = ({ onSelectMarketplace }) => {
  return (
    <Section id="supported-marketplaces" size="md" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="wide">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            India Marketplace Sourcing Coverage
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Supported Indian Online Stores
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: 'var(--space-2) auto 0' }}>
            Paste links from any of these major Indian marketplaces. Our procurement network sources directly from verified sellers across India.
          </Typography>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {SUPPORTED_MARKETPLACES.map((mp) => (
            <Card key={mp.id} style={{
              padding: '16px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {mp.name}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                }}>
                  {mp.domain}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {mp.category}
              </p>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Independent logistics &amp; parcel forwarding service. Store names and trademarks belong to their respective owners.
        </div>
      </Container>
    </Section>
  );
};

export default SupportedMarketplacesSection;
