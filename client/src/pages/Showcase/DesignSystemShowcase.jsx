import React, { useState } from 'react';
import { Container } from '../../components/layout/Container.jsx';
import { Section } from '../../components/layout/Section.jsx';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { FormField, Input, Textarea, Select, Checkbox } from '../../components/forms';
import { Spinner, Skeleton, SkeletonCard, ErrorAlert, EmptyState } from '../../components/feedback';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/common/Table.jsx';
import { useToast } from '../../hooks/useToast.js';

/**
 * SastoMarts Design System Showcase
 * Demonstrates live interactive tokens, typography, forms, cards, statuses, tables, and feedback.
 */
export const DesignSystemShowcase = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [sampleUrl, setSampleUrl] = useState('https://www.amazon.in/dp/B08N5WRWNW');
  const [sampleEmail, setSampleEmail] = useState('customer@sajilomarts.com');
  const [sampleService, setSampleService] = useState('standard');
  const [sampleAgreement, setSampleAgreement] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {/* 1. Header & Typography Section */}
      <Section size="sm" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <Container size="wide">
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)' }}>
            Design System Foundation &bull; Prompt 16
          </Typography>
          <Typography variant="display" style={{ marginTop: 'var(--space-1)' }}>
            SastoMarts Visual System
          </Typography>
          <Typography variant="body" style={{ maxWidth: '640px', marginTop: 'var(--space-2)' }}>
            Calm, restrained, product-focused design system crafted for cross-border India-to-Nepal sourcing.
          </Typography>
        </Container>
      </Section>

      <Container size="wide" style={{ marginTop: 'var(--space-8)' }}>
        {/* 2. Color Palette & Typography Tokens */}
        <Section size="sm">
          <Typography variant="h2" style={{ marginBottom: 'var(--space-4)' }}>
            1. Warm Neutral Palette &amp; Typography
          </Typography>
          <div className="layout-grid-2">
            <Card>
              <CardHeader title="Neutral &amp; Brand Surfaces" description="Subtle warm contrast without harsh white or saturated themes" />
              <CardBody>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: 'var(--bg-page)', border: '1px solid var(--border-subtle)', padding: '12px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Page BG</div>
                    <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#FAF8F5</code>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '12px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Surface</div>
                    <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#FFFFFF</code>
                  </div>
                  <div style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', padding: '12px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Subtle</div>
                    <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>#F4F1EA</code>
                  </div>
                  <div style={{ background: 'var(--color-brand)', color: '#ffffff', padding: '12px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Brand Accent</div>
                    <code style={{ fontSize: '0.7rem', color: '#fef2f2' }}>#B83A20</code>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Typographic Hierarchy" description="System font stack with no Inter, Geist, or Space Grotesk" />
              <CardBody>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><Typography variant="h3">Headline Level 3 &mdash; 1.25rem</Typography></div>
                  <div><Typography variant="body">Body copy &mdash; Regular 1rem high-legibility text designed for reading cross-border policies and calculations.</Typography></div>
                  <div><Typography variant="caption">Caption &mdash; 0.75rem secondary contextual annotation.</Typography></div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* 3. Interactive Buttons */}
        <Section size="sm">
          <Typography variant="h2" style={{ marginBottom: 'var(--space-4)' }}>
            2. Button System &amp; Interactive Feedback
          </Typography>
          <Card>
            <CardBody>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost Link</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" loading={isLoading} onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 1500);
                }}>
                  {isLoading ? 'Processing...' : 'Test Loading State'}
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button variant="outline" size="sm" onClick={() => showSuccess('Quote confirmed and saved to your account!', 'Sourcing Update')}>
                  Trigger Success Toast
                </Button>
                <Button variant="outline" size="sm" onClick={() => showError('Please check your marketplace URL and try again.', 'Validation Error')}>
                  Trigger Error Toast
                </Button>
                <Button variant="outline" size="sm" onClick={() => showWarning('Product delivery address is outside primary valley zone.', 'Notice')}>
                  Trigger Warning Toast
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* 4. Form Components & URL Sourcing Input */}
        <Section size="sm">
          <Typography variant="h2" style={{ marginBottom: 'var(--space-4)' }}>
            3. Accessible Form Primitives &amp; Sourcing Input
          </Typography>
          <div className="layout-grid-2">
            <Card>
              <CardHeader title="Product URL Sourcing Input" description="High prominence without ornamental gradients or neon styling" />
              <CardBody>
                <FormField
                  id="showcase-url"
                  label="Indian Marketplace Product URL"
                  required
                  helperText="Supported: amazon.in, flipkart.com, myntra.com, ajio.com, nykaa.com"
                >
                  <Input
                    id="showcase-url"
                    value={sampleUrl}
                    onChange={(e) => setSampleUrl(e.target.value)}
                    placeholder="https://www.amazon.in/dp/..."
                    className="form-input--url"
                  />
                </FormField>

                <FormField
                  id="showcase-email"
                  label="Contact Email"
                  required
                >
                  <Input
                    id="showcase-email"
                    type="email"
                    value={sampleEmail}
                    onChange={(e) => setSampleEmail(e.target.value)}
                  />
                </FormField>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Form Controls &amp; Options" description="Standardized dropdowns, checkboxes, and textareas" />
              <CardBody>
                <FormField id="showcase-delivery" label="Delivery Priority">
                  <Select
                    id="showcase-delivery"
                    value={sampleService}
                    onChange={(e) => setSampleService(e.target.value)}
                    options={[
                      { value: 'standard', label: 'Standard Cross-Border (5-8 Business Days)' },
                      { value: 'express', label: 'Express Delivery (3-5 Business Days)' },
                    ]}
                  />
                </FormField>

                <FormField id="showcase-notes" label="Special Sourcing Instructions (Optional)">
                  <Textarea
                    id="showcase-notes"
                    placeholder="Provide specific color, variant, or packaging requests..."
                    rows={2}
                  />
                </FormField>

                <Checkbox
                  id="showcase-agree"
                  checked={sampleAgreement}
                  onChange={(e) => setSampleAgreement(e.target.checked)}
                  label="I agree to cross-border verification terms (Draft for review)"
                />
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* 5. Status Badges & Lifecycle Presentation */}
        <Section size="sm">
          <Typography variant="h2" style={{ marginBottom: 'var(--space-4)' }}>
            4. Lifecycle Status Presentation
          </Typography>
          <Card>
            <CardBody>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusBadge status="draft" />
                <StatusBadge status="submitted" />
                <StatusBadge status="under_review" />
                <StatusBadge status="quote_ready" />
                <StatusBadge status="customer_confirmed" />
                <StatusBadge status="cancelled" />
                <StatusBadge status="expired" />
                <StatusBadge status="converted" />
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* 6. Responsive Table & Skeleton Loaders */}
        <Section size="sm">
          <Typography variant="h2" style={{ marginBottom: 'var(--space-4)' }}>
            5. Responsive Table &amp; Skeleton States
          </Typography>
          <div className="layout-grid-2">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Request ID</TableHeaderCell>
                  <TableHeaderCell>Marketplace</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Estimate (NPR)</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>#SM-9821</code></TableCell>
                  <TableCell>Amazon India</TableCell>
                  <TableCell><StatusBadge status="quote_ready" /></TableCell>
                  <TableCell>रू 4,850.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>#SM-9820</code></TableCell>
                  <TableCell>Myntra</TableCell>
                  <TableCell><StatusBadge status="customer_confirmed" /></TableCell>
                  <TableCell>रू 2,420.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <SkeletonCard />
          </div>
        </Section>

        {/* 7. Error Alert & Empty State Demo */}
        <Section size="sm" style={{ marginBottom: 'var(--space-12)' }}>
          <Typography variant="h2" style={{ marginBottom: 'var(--space-4)' }}>
            6. Safe Error &amp; Empty State Foundations
          </Typography>
          <div className="layout-grid-2">
            <div>
              <ErrorAlert
                title="Cross-Border Sourcing Notice"
                message="Indian marketplace stock verification is refreshed in real-time before quote finalization."
              />
            </div>
            <EmptyState
              title="No Pending Orders"
              description="You have no active orders in transit. Submit an Indian product URL to get your authoritative quote."
              actionLabel="Create Sourcing Request"
              onAction={() => showInfo('Navigating to Sourcing Request form...')}
            />
          </div>
        </Section>
      </Container>
    </div>
  );
};

export default DesignSystemShowcase;
