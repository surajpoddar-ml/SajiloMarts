import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { FormField } from '../../components/forms/FormField.jsx';
import { validateProductUrl, detectMarketplace, validateRequired } from '../../utils/formValidation.js';

/**
 * SourcingRequestInteractiveForm
 * Form enabling customers to submit Indian product specifications for sourcing & official quote generation.
 */
export const SourcingRequestInteractiveForm = ({
  initialProductUrl = '',
  onSubmitReview,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    productUrl: initialProductUrl,
    productName: '',
    productPriceInr: '',
    quantity: 1,
    variant: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialProductUrl && initialProductUrl !== formData.productUrl) {
      setFormData((prev) => ({ ...prev, productUrl: initialProductUrl }));
    }
  }, [initialProductUrl]);

  const detectedMarketplace = detectMarketplace(formData.productUrl);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let err = null;
    if (field === 'productUrl') {
      err = validateProductUrl(value);
    } else if (field === 'productName') {
      err = validateRequired(value, 'Product name');
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleProceed = (e) => {
    if (e) e.preventDefault();
    const urlErr = validateProductUrl(formData.productUrl);
    const nameErr = validateRequired(formData.productName, 'Product name');

    setTouched({
      productUrl: true,
      productName: true,
      quantity: true,
    });

    setErrors({
      productUrl: urlErr,
      productName: nameErr,
    });

    if (urlErr || nameErr) {
      return;
    }

    if (onSubmitReview) {
      onSubmitReview({
        ...formData,
        marketplace: detectedMarketplace?.name || 'Indian Marketplace',
        quantity: Math.max(1, parseInt(formData.quantity, 10) || 1),
      });
    }
  };

  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardHeader
        title="Step 1: Product Specifications"
        description="Provide the exact item details to ensure accurate sourcing from India"
      />
      <CardBody>
        <form onSubmit={handleProceed} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Product URL & Marketplace detection */}
            <FormField
              label="Product URL from India"
              required
              error={errors.productUrl}
              hint={detectedMarketplace ? `Detected Marketplace: ${detectedMarketplace.name} (${detectedMarketplace.domain})` : 'Supported: Amazon India, Flipkart, Myntra, Meesho, Tata 1mg'}
            >
              <Input
                name="productUrl"
                type="url"
                value={formData.productUrl}
                onChange={(e) => handleChange('productUrl', e.target.value)}
                onBlur={() => handleBlur('productUrl')}
                placeholder="https://www.amazon.in/dp/..."
                hasError={Boolean(errors.productUrl)}
                disabled={isLoading}
              />
            </FormField>

            {/* Product Name */}
            <FormField
              label="Product Name / Title"
              required
              error={errors.productName}
              hint="Enter the product title as listed on the Indian store"
            >
              <Input
                name="productName"
                type="text"
                value={formData.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
                onBlur={() => handleBlur('productName')}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                hasError={Boolean(errors.productName)}
                disabled={isLoading}
              />
            </FormField>

            {/* Estimated Price in INR (Optional initial customer estimate) */}
            <FormField
              label="Product Price in INR (₹) — As listed on store"
              hint="Server quote engine calculates NPR total with live exchange rate and fees"
            >
              <Input
                name="productPriceInr"
                type="number"
                min="1"
                step="any"
                value={formData.productPriceInr}
                onChange={(e) => handleChange('productPriceInr', e.target.value)}
                placeholder="e.g. 24990 (Leave empty if unsure)"
                disabled={isLoading}
              />
            </FormField>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                Continue to Review &amp; Quote &rarr;
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default SourcingRequestInteractiveForm;
